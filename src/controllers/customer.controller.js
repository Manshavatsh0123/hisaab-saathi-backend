const supabase = require("../config/supabase");

async function createCustomer(req, res, next) {
    try {
        const {
            full_name,
            phone,
            alternate_phone,
            aadhaar_number,
            pan_number,
            nominee_name,
        } = req.body || {};

        // Validate required fields
        if (!full_name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Full name and phone are required",
            });
        }

        // Generate customer code
        const customerCode = `CUS-${Date.now()}`;

        // Create customer
        const { data: customer, error } = await supabase
            .from("customers")
            .insert({
                customer_code: customerCode,
                full_name,
                phone,
                alternate_phone: alternate_phone || null,
                aadhaar_number: aadhaar_number || null,
                pan_number: pan_number || null,
                nominee_name: nominee_name || null,
                status: "ACTIVE",
                created_by: req.user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Create customer error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create customer",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            customer,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createCustomer,
};