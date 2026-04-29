import pool from "../config/db.js";
import { getPincodeFromCoordinates } from "../utlis/ocr/location.js";
import { extractPharmacyDataFromImage, hashImage } from "../utlis/ocr/ocr.js";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../uploads/scans');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/**
 * POST /api/pharmacy/extract
 * Step 1: AI extracts data from image + GPS lookup — does NOT save to DB
 */
async function extractPharmacy(req, res) {
    const { image, latitude, longitude } = req.body;
    const { UserId } = req?.user;

    if (!image || !latitude || !longitude) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: image, latitude, longitude'
        });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const base64Image = image.includes(',') ? image.split(',')[1] : image;

    try {
        console.log('🔍 Extracting pharmacy data with AI...');
        const extracted = await extractPharmacyDataFromImage(base64Image);

        if (!extracted.success) {
            return res.status(400).json({
                success: false,
                error: 'Could not read the image. Please retake the photo.',
                details: extracted.error
            });
        }

        const { name, phone, email, address } = extracted;

        console.log('📍 Getting location from GPS...');
        const locationData = await getPincodeFromCoordinates(lat, lon);

        const pincode  = locationData.success ? locationData.pincode  : null;
        const city     = locationData.success ? locationData.city     : null;
        const district = locationData.success ? locationData.district : null;
        const state    = locationData.success ? locationData.state    : null;

        res.status(200).json({
            success: true,
            extracted: {
                name:    name    !== 'NOT_FOUND' ? name    : null,
                phone:   phone   !== 'NOT_FOUND' ? phone   : null,
                email:   email   !== 'NOT_FOUND' ? email   : null,
                address: address !== 'NOT_FOUND' ? address : null,
                location: { pincode, city, district, state, latitude: lat, longitude: lon }
            }
        });

    } catch (error) {
        console.error('❌ Extract error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server error during extraction',
            details: error.message
        });
    }
}

/**
 * POST /api/pharmacy/save
 * Step 2: MR confirmed the data — save image to disk and record to DB
 */
async function savePharmacy(req, res) {
    const { image, extracted, timestamp, deviceId } = req.body;
    const { UserId } = req?.user;

    if (!image || !extracted) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: image, extracted'
        });
    }

    const { name, phone, email, address, location } = extracted;
    const { pincode, city, district, state, latitude, longitude } = location || {};
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    const base64Image = image.includes(',') ? image.split(',')[1] : image;

    try {
        const scanId   = uuidv4();
        const imgHash  = hashImage(base64Image);
        const ts       = timestamp || Date.now();
        const fileName = `${scanId}.jpg`;
        const filePath = path.join(UPLOADS_DIR, fileName);

        console.log('🖼️  Saving image to disk...');
        fs.writeFileSync(filePath, Buffer.from(base64Image, 'base64'));
        const imagePath = `/uploads/scans/${fileName}`;

        console.log('💾 Saving to database...');
        await pool.execute(
            `INSERT INTO scanned_pharmacies
               (id, name, phone, email, address, latitude, longitude, pincode, city, district, state,
                device_id, timestamp, image_hash, image_path, UserId, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [scanId, name, phone, email, address, lat, lon, pincode, city, district, state,
             deviceId, ts, imgHash, imagePath, UserId]
        );

        console.log('✅ Saved! ID:', scanId);

        res.status(200).json({
            success: true,
            message: 'Data saved successfully',
            pharmacy: {
                id: scanId,
                name, phone, email, address,
                location: { pincode, city, district, state, latitude: lat, longitude: lon },
                image_path: imagePath,
                scanned_at: new Date().toISOString(),
                UserId, deviceId
            }
        });

    } catch (error) {
        console.error('❌ Save error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server error while saving data',
            details: error.message
        });
    }
}

export { extractPharmacy, savePharmacy };
