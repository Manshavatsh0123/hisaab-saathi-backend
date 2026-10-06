const supabase = require("../config/supabase");

async function createAccount(req, res, next) {
    try {
        const { customerId } = req.params;

        const {
            account_number,
            scheme,
            account_name,
            collection_amount,
            frequency,
            start_date,
            maturity_date,
            previous_paid,
        } = req.body || {};

        // Validate required fields
        if (
            !account_number ||
            !scheme ||
            !account_name ||
            collection_amount === undefined ||
            !frequency ||
            !start_date
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Account number, scheme, account name, collection amount, frequency and start date are required",
            });
        }

        // Check customer exists
        const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("id, full_name, status")
            .eq("id", customerId)
            .single();

        if (customerError || !customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Don't create account for inactive customer
        if (customer.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Customer account is inactive",
            });
        }

        // Create customer account
        const { data: account, error } = await supabase
            .from("customer_accounts")
            .insert({
                customer_id: customerId,
                account_number,
                scheme,
                account_name,
                collection_amount,
                frequency,
                start_date,
                maturity_date: maturity_date || null,
                previous_paid: previous_paid || 0,
                status: "ACTIVE",
            })
            .select()
            .single();

        if (error) {
            console.error("Create account error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create customer account",
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Customer account created successfully",
            account,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAccount,
};