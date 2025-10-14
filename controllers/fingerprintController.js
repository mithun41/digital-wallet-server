const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
// const base64url = require("base64url"); // Not needed for this file's logic

// In-memory storage (replace with DB in production)
const userCredentials = new Map();

// ------------------- START REGISTRATION -------------------
// const startFingerprintRegistration = (req, res) => { // ❌ ভুল: async নেই
const startFingerprintRegistration = async (req, res) => {
  // ✅ সঠিক: async যোগ করুন
  const user = req.user;

  if (!user || !user._id || !user.phone) {
    return res
      .status(401)
      .json({ message: "Authentication failed or user data missing." });
  }

  // userID Uint8Array
  const userID = Uint8Array.from(Buffer.from(user._id.toString(), "hex"));

  // 🔑 FIX: generateRegistrationOptions এর আগে 'await' যোগ করুন
  const options = await generateRegistrationOptions({
    rpName: "PayMate Wallet",
    rpID: "localhost",
    userID,
    userName: user.phone,
    attestationType: "none",
    authenticatorSelection: {
      userVerification: "required",
      authenticatorAttachment: "platform",
    },
  });

  // store challenge in memory
  userCredentials.set(user._id.toString(), {
    challenge: options.challenge,
    phone: user.phone,
  });

  // লগ এখন ঠিকভাবে আসবে:
  console.log("Options:", options);
  console.log("Challenge:", options.challenge);

  return res.json(options);
};

// ------------------- VERIFY REGISTRATION -------------------
// fingerprintController.js

const verifyFingerprintRegistration = async (req, res) => {
  const user = req.user;
  const body = req.body;

  const previousData = userCredentials.get(user._id.toString());
  const expectedChallenge = previousData?.challenge;

  if (!expectedChallenge)
    return res.status(400).json({ message: "No challenge found for user" });

  try {
    const verification = await verifyRegistrationResponse({
      credential: body,
      expectedChallenge, // 🔑 FIX: Origin অবশ্যই আপনার ফ্রন্টএন্ডের URL হতে হবে।
      expectedOrigin: "http://localhost:5173",
      expectedRPID: "localhost",
    });

    // ... (rest of the verification and save logic)
    if (!verification.verified) {
      return res
        .status(400)
        .json({ message: "Registration verification failed" });
    }

    // ... save credential info

    res.json({ verified: true });
  } catch (err) {
    console.error("WebAuthn Verification Error:", err); // ডিবাগিং এর জন্য লগটি উন্নত করা হলো
    res.status(500).json({ message: err.message });
  }
};

// ------------------- LOGIN -------------------

// Start fingerprint login
const startFingerprintLogin = (req, res) => {
  const { phone } = req.body;

  // Find user credential by phone
  const credentialData = [...userCredentials.values()].find(
    (c) => c.phone === phone
  );
  if (!credentialData || !credentialData.credentialID)
    return res.status(404).json({ message: "Fingerprint not registered" });

  // Note: SimpleWebAuthn generates the challenge internally.
  const options = generateAuthenticationOptions({
    allowCredentials: [{ id: credentialData.credentialID, type: "public-key" }],
    userVerification: "required",
  });

  // Store challenge back onto the same object for verification
  credentialData.challenge = options.challenge;

  res.json(options);
};

// Verify fingerprint login
const verifyFingerprintLogin = async (req, res) => {
  const { phone, response } = req.body;

  if (!response || !response.id) {
    return res
      .status(400)
      .json({ message: "No authentication data provided or invalid" });
  }

  const credentialData = [...userCredentials.values()].find(
    (c) => c.phone === phone
  );
  if (!credentialData)
    return res.status(404).json({ message: "Fingerprint not found" });

  try {
    const jwt = require("jsonwebtoken");

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: credentialData.challenge,
      expectedOrigin: "http://localhost:5173", // Frontend origin
      expectedRPID: "localhost",
      authenticator: {
        credentialID: credentialData.credentialID,
        credentialPublicKey: credentialData.credentialPublicKey,
        counter: credentialData.counter,
      },
    });

    if (!verification.verified)
      return res.status(400).json({ message: "Fingerprint login failed" });

    // Update counter
    credentialData.counter = verification.authenticationInfo.newCounter;

    // ✅ Ensure _id exists in credentialData for JWT
    const userId = credentialData._id || "temp-id"; // replace with actual DB _id if available

    const token = jwt.sign(
      { phone: credentialData.phone, _id: userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error("WebAuthn Login Verification Error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  startFingerprintRegistration,
  verifyFingerprintRegistration,
  startFingerprintLogin,
  verifyFingerprintLogin,
  userCredentials,
};
