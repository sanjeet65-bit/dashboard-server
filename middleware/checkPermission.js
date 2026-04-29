import pool from "../config/db.js";


const checkPermission = async (req, res, next) => {
    const { method, originalUrl } = req;

    const [rows] = await pool.query(
        `select * from api_permissions where method = ? and route = ?`,
        [method, originalUrl]
    );

    if (!rows.length) return next(); // public API

    const requiredPermission = rows[0].permission_id;

    if (!req.user.permission.includes(requiredPermission)) {
        return res.status(403).json({ message: "Access denied" });
    }

    next();
};


export { checkPermission }
