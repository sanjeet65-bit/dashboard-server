import app from "./app.js";
import pool from "./config/db.js"


const PORT = process.env.PORT || 3000;



(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1); // stop server if DB fails
  }
})();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
