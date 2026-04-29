import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
    getAllUsers,
    getAllRoles,
    getAllPermissions,

    getUserById,
    getRolePermissionById,

    addUser,
    addRole,

    updateUser,
    updateRolePermission,

    deleteUser,
    deleteRole
    
} from '../controllers/master.controller.js'


const router = Router()

router.get('/getallusers', auth, getAllUsers)
router.get('/getallroles', auth, getAllRoles)
router.get('/getallpermissions', auth, getAllPermissions)


router.get('/getuser/:UserId', auth, getUserById)
router.get('/getrolepermission/:roleid', auth, getRolePermissionById)


router.post('/adduser', auth, addUser)
router.post('/addrole', auth, addRole)


router.put('/updateuser', auth, updateUser)
router.put('/updaterolepermission', auth, updateRolePermission)

router.delete('/deleteuser/:UserId', auth, deleteUser)
router.delete('/deleterole/:roleid', auth, deleteRole)



export default router