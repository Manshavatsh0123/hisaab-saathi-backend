const supabase = require("../config/supabase");


const createStaff = async (req, res) => {
    try {
        const {
            full_name,
            username,
            phone,
            password,
        } = req.body;


        if (!full_name || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, username and password are required",
            });
        }

        const cleanName = full_name.trim();
        const cleanUsername = username.trim().toLowerCase();
        const cleanPhone = phone
            ? phone.trim()
            : null;

        if (cleanUsername.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username must be at least 3 characters",
            });
        }

        if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message:
                    "Username can contain only letters, numbers, dot, underscore and hyphen",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const { data: existingProfile, error: profileCheckError } =
            await supabase
                .from("profiles")
                .select("id")
                .eq("username", cleanUsername)
                .maybeSingle();

        if (profileCheckError) {
            console.error(
                "Username check error:",
                profileCheckError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to check username",
                error: profileCheckError.message,
            });
        }

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Username already exists",
            });
        }

        const authEmail =
            `${cleanUsername}@hisaabsaathi.local`;

        const {
            data: authData,
            error: authError,
        } = await supabase.auth.admin.createUser({
            email: authEmail,
            password,
            email_confirm: true,
        });

        if (authError) {
            console.error(
                "Create staff auth user error:",
                authError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to create staff authentication",
                error: authError.message,
            });
        }

        const userId = authData.user.id;

        const staffCode =
            `STF-${Date.now()}`;

        const {
            data: profile,
            error: profileError,
        } = await supabase
            .from("profiles")
            .insert([
                {
                    id: userId,
                    role: "STAFF",
                    username: cleanUsername,
                    full_name: cleanName,
                    phone: cleanPhone,
                    status: "ACTIVE",
                },
            ])
            .select()
            .single();

        if (profileError) {
            console.error(
                "Create staff profile error:",
                profileError
            );

            // Roll back Auth user if profile creation fails
            await supabase.auth.admin.deleteUser(userId);

            return res.status(500).json({
                success: false,
                message: "Failed to create staff profile",
                error: profileError.message,
            });
        }

        const {
            data: staff,
            error: staffError,
        } = await supabase
            .from("staff")
            .insert([
                {
                    user_id: userId,
                    staff_code: staffCode,
                    created_by: req.user.id,
                },
            ])
            .select()
            .single();

        if (staffError) {
            console.error(
                "Create staff record error:",
                staffError
            );

            // Roll back profile + auth
            await supabase
                .from("profiles")
                .delete()
                .eq("id", userId);

            await supabase.auth.admin.deleteUser(userId);

            return res.status(500).json({
                success: false,
                message: "Failed to create staff record",
                error: staffError.message,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Staff created successfully",

            staff: {
                id: staff.id,
                user_id: staff.user_id,
                staff_code: staff.staff_code,
                full_name: profile.full_name,
                username: profile.username,
                phone: profile.phone,
                role: profile.role,
                status: profile.status,
            },
        });

    } catch (error) {
        console.error(
            "Create staff exception:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createStaff,
};