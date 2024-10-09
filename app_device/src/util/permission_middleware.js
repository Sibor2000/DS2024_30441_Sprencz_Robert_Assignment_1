import path from "path";
import * as url from "url"

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const permitAdminOrSelf = (req, res, next) => {
    if (req.session.user_data && (req.session.user_data.role === "admin" || req.session.user_data.user_id == req.params.id)) {
        next();
    } else {
        res.send(403).send({ "message": "Permission denied" })
    }
}

export const rolesPermissionFilter = (roleArray) => {
    return async (req, res, next) => {
        if (req.session.user_data && roleArray.includes(req.session.user_data.role)) {
            next();
        } else {
            res.status(403).send({
                "message": "Permission denied"
            })
        }

    }
}

export const loggedInFilter = async (req, res, next) => {
    if (!req.session || !req.session.user_data) {
        res.status(401).send({
            "message": "Not logged in"
        })
        return;
    }
    next();
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
