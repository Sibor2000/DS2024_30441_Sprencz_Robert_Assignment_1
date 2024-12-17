import path from "path";
import * as url from "url"
import { jwtVerify } from "jose";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const permitAdminOrSelf = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.id == req.params.id)) {
        next();
    } else {
        res.send(403).send({ "message": "Permission denied" })
    }
}

export const rolesPermissionFilter = (roleArray) => {
    return async (req, res, next) => {
        if (req.user && roleArray.includes(req.user.role)) {
            next();
        } else {
            res.status(403).send({
                "message": "Permission denied"
            })
        }

    }
}

export const sameAsUserId = (someId) => {
    return async (req, res, next) => {
        if (req.session.user_data.user_id === someId) {
            next();
        } else {
            res.status(403).send({
                "message": "Permission denied"
            })
        }
    }
}

export const verifyJWT = async(req,res,next) => {
    const authHeader = req.headers['authorization']

    if(!authHeader){
        res.status(401).send({
            "message":"auth header missing"
        })
        return
    }

    const token = authHeader.split(' ')[1];
    const mySecret = Buffer.from(process.env.JWT_SECRET, 'utf-8')
    try{
        const {payload} = await jwtVerify(token, mySecret)
        req.user = payload
        req.token = token
        next()
    }catch(error){
        return res.status(401).send({"message":"invalid token"})
    }
}
