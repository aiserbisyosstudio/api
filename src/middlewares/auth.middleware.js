export default function authMiddleware(req, res, next) {
  console.log("AUTH SESSION ID in middleware:", req.sessionID);
  console.log("AUTH SESSION in middleware:", req.session);
  console.log("COOKIE in middleware:", req.headers.cookie);
  if (!req.session.accessToken) {
    return res.status(401).json({
      message: "Please login to access the feature",
    });
  }
  next();
}