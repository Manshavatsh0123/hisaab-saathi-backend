const supabase = require("../config/supabase");
const supabaseAuth = require("../config/supabase-auth");

async function login(req, res, next) {
    try {
        const { email, password } = req.body || {};

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabaseAuth.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user || !data.session) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, role, username, full_name, phone, status")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            console.error("Profile lookup error:", profileError);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch user profile",
            });
        }

        if (!profile) {
            return res.status(403).json({
                success: false,
                message: "User profile not found",
            });
        }

        // Check account status
        if (profile.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "User account is inactive",
            });
        }

        // Only ADMIN can use this login
        if (profile.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            user: {
                id: data.user.id,
                email: data.user.email,
            },
            profile: {
                id: profile.id,
                role: profile.role,
                username: profile.username,
                full_name: profile.full_name,
                phone: profile.phone,
                status: profile.status,
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function staffLogin(req, res, next) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const {
            data,
            error,
        } = await supabaseAuth.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user || !data.session) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const {
            data: profile,
            error: profileError,
        } = await supabase
            .from("profiles")
            .select(
                "id, role, username, full_name, phone, status"
            )
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            console.error(
                "Staff profile lookup error:",
                profileError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch user profile",
            });
        }

        if (!profile) {
            return res.status(403).json({
                success: false,
                message: "Staff profile not found",
            });
        }

        if (profile.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Staff account is inactive",
            });
        }

        if (profile.role !== "STAFF") {
            return res.status(403).json({
                success: false,
                message: "Staff access required",
            });
        }

        const {
            data: staff,
            error: staffError,
        } = await supabase
            .from("staff")
            .select(
                "id, user_id, staff_code, created_at"
            )
            .eq("user_id", data.user.id)
            .single();

        if (staffError) {
            console.error(
                "Staff record lookup error:",
                staffError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch staff record",
            });
        }

        if (!staff) {
            return res.status(403).json({
                success: false,
                message: "Staff record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Staff login successful",

            user: {
                id: data.user.id,
                email: data.user.email,
            },

            profile: {
                id: profile.id,
                role: profile.role,
                username: profile.username,
                full_name: profile.full_name,
                phone: profile.phone,
                status: profile.status,
            },

            staff: {
                id: staff.id,
                staff_code: staff.staff_code,
            },

            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
            },
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    staffLogin,
};