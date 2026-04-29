import pool from "../config/db.js";


const profile = async (req,res)=>{

  const UserId = req.user.user[0].UserId

  const raw = await pool.query("select * from logins where UserId= ? ",[UserId])

  const data = raw[0]

  return res.status(200).json({success: true, data: data})
}


export default profile