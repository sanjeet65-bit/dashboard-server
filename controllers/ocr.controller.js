import pool from "../config/db.js";
import { getPincodeFromCoordinates } from "../utlis/ocr/location.js";
import { extractPharmacyDataFromImage, hashImage } from "../utlis/ocr/ocr.js";
import { v4 as uuidv4 } from 'uuid';


async function scanPharmacy(req, res) {
    const { image, latitude, longitude, deviceId, timestamp } = req.body;
    const { UserId } = req?.user

    console.log(req.body)
    if (!image || !latitude || !longitude || !deviceId) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: image, latitude, longitude, deviceId'
        });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    const base64Image = image.includes(',') ? image.split(',')[1] : image;

    try {
        // 1. Extract data from image using Claude AI
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


        console.log(extracted)

        // 2. Get pincode from GPS
        console.log('📍 Getting location from GPS...');
        const locationData = await getPincodeFromCoordinates(lat, lon);

        const pincode = locationData.success ? locationData.pincode : null;
        const city = locationData.success ? locationData.city : null;
        const district = locationData.success ? locationData.district : null;
        const state = locationData.success ? locationData.state : null;

        // 3. Save to DB
        console.log('💾 Saving to database...');
        const scanId = uuidv4();
        const imgHash = hashImage(base64Image);
        const ts = timestamp || Date.now();

        await pool.execute(
            `INSERT INTO scanned_pharmacies
         (id, name, phone, email, address, latitude, longitude, pincode, city, district, state,
          device_Id, timestamp, image_hash, UserId, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                scanId,
                name !== 'NOT_FOUND' ? name : null,
                phone !== 'NOT_FOUND' ? phone : null,
                email !== 'NOT_FOUND' ? email : null,
                address !== 'NOT_FOUND' ? address : null,
                lat, lon,
                pincode, city, district, state,
                deviceId, ts, imgHash, UserId
            ]
        );

        console.log('✅ Saved! ID:', scanId);

        res.status(200).json({
            success: true,
            message: 'Data saved successfully',
            pharmacy: {
                id: scanId,
                name: name !== 'NOT_FOUND' ? name : null,
                phone: phone !== 'NOT_FOUND' ? phone : null,
                email: email !== 'NOT_FOUND' ? email : null,
                address: address !== 'NOT_FOUND' ? address : null,
                location: { pincode, city, district, state, latitude: lat, longitude: lon },
                scanned_at: new Date().toISOString(),
                deviceId
            }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server error while saving data',
            details: error.message
        });
    }
}


export { scanPharmacy }