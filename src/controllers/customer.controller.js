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

async function getCustomerDetails(req, res, next) {
    try {
        const { customerId } = req.params;


        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required",
            });
        }

        const {
            data: customer,
            error: customerError,
        } = await supabase
            .from("customers")
            .select(`
                id,
                user_id,
                customer_code,
                full_name,
                phone,
                alternate_phone,
                aadhaar_number,
                pan_number,
                nominee_name,
                status,
                created_by,
                created_at,
                updated_at
            `)
            .eq("id", customerId)
            .single();


        if (customerError || !customer) {
            console.error(
                "Get customer error:",
                customerError
            );

            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        const {
            data: accounts,
            error: accountsError,
        } = await supabase
            .from("customer_accounts")
            .select(`
                id,
                customer_id,
                account_number,
                scheme,
                account_name,
                collection_amount,
                frequency,
                start_date,
                maturity_date,
                previous_paid,
                status,
                created_at,
                updated_at
            `)
            .eq("customer_id", customerId)
            .order("created_at", {
                ascending: true,
            });

        if (accountsError) {
            console.error(
                "Get customer accounts error:",
                accountsError
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch customer accounts",
            });
        }

        return res.status(200).json({
            success: true,
            customer,
            accounts: accounts || [],
        });

    } catch (error) {
        console.error(
            "Get customer details unexpected error:",
            error
        );

        next(error);
    }
}


const listCustomers = async (req, res) => {
    try {
        let {
            search = "",
            status,
            page = 1,
            limit = 20,
        } = req.query;

        // Convert pagination values to numbers
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        // Safe pagination defaults
        if (isNaN(page) || page < 1) {
            page = 1;
        }

        if (isNaN(limit) || limit < 1) {
            limit = 20;
        }

        // Maximum 100 records per request
        if (limit > 100) {
            limit = 100;
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("customers")
            .select(
                `
                id,
                customer_code,
                full_name,
                phone,
                alternate_phone,
                status,
                created_at
                `,
                { count: "exact" }
            );

        if (search && search.trim()) {
            const cleanSearch = search
                .trim()
                .replace(/[%_]/g, "");

            query = query.or(
                `full_name.ilike.%${cleanSearch}%,phone.ilike.%${cleanSearch}%,customer_code.ilike.%${cleanSearch}%`
            );
        }

        if (status && status.trim()) {
            query = query.eq("status", status.trim().toUpperCase());
        }

        query = query
            .order("created_at", { ascending: false })
            .range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error("List customers error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch customers",
                error: error.message,
            });
        }

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            customers: data || [],
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });

    } catch (error) {
        console.error("List customers exception:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createCustomer,
    getCustomerDetails,
    listCustomers,
};