const supabase = require("../config/supabase");


const approveAdminCollection = async (req, res) => {
    try {
        const { paymentId } = req.params;


        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required",
            });
        }


        const {
            data: payment,
            error: paymentError,
        } = await supabase
            .from("payments")
            .select(`
                id,
                customer_id,
                account_id,
                amount,
                payment_date,
                status,
                created_by,
                approved_by,
                approved_at,
                receipt_number
            `)
            .eq("id", paymentId)
            .single();

        if (paymentError || !payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }


        if (payment.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    `Payment cannot be approved because its current status is ${payment.status}`,
            });
        }

        const {
            data: approvedPaymentId,
            error: approveError,
        } = await supabase.rpc("approve_payment", {
            p_payment_id: paymentId,
            p_approved_by: req.user.id,
        });

        if (approveError) {
            console.error(
                "Approve payment RPC error:",
                approveError
            );

            return res.status(400).json({
                success: false,
                message: approveError.message,
            });
        }


        const {
            data: updatedPayment,
            error: updatedPaymentError,
        } = await supabase
            .from("payments")
            .select(`
                id,
                customer_id,
                account_id,
                amount,
                payment_date,
                status,
                created_by,
                approved_by,
                approved_at,
                receipt_number,
                updated_at
            `)
            .eq("id", approvedPaymentId)
            .single();

        if (updatedPaymentError) {
            console.error(
                "Fetch approved payment error:",
                updatedPaymentError
            );

            return res.status(500).json({
                success: false,
                message:
                    "Payment was approved but updated payment could not be fetched",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment approved successfully",
            payment: updatedPayment,
        });

    } catch (error) {
        console.error(
            "Approve admin collection exception:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const rejectAdminCollection = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { rejection_reason } = req.body;


        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required",
            });
        }

        if (
            !rejection_reason ||
            typeof rejection_reason !== "string" ||
            !rejection_reason.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required",
            });
        }

        const rejectionReason = rejection_reason.trim();

        const {
            data: payment,
            error: paymentError,
        } = await supabase
            .from("payments")
            .select(`
                id,
                customer_id,
                account_id,
                amount,
                payment_date,
                status,
                created_by,
                rejected_by,
                rejected_at,
                rejection_reason
            `)
            .eq("id", paymentId)
            .single();

        if (paymentError || !payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }


        if (payment.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    `Payment cannot be rejected because its current status is ${payment.status}`,
            });
        }

        const {
            data: rejectedPaymentId,
            error: rejectError,
        } = await supabase.rpc("reject_payment", {
            p_payment_id: paymentId,
            p_rejected_by: req.user.id,
            p_rejection_reason: rejectionReason,
        });

        if (rejectError) {
            console.error(
                "Reject payment RPC error:",
                rejectError
            );

            return res.status(400).json({
                success: false,
                message: rejectError.message,
            });
        }

        const {
            data: updatedPayment,
            error: updatedPaymentError,
        } = await supabase
            .from("payments")
            .select(`
                id,
                customer_id,
                account_id,
                amount,
                payment_date,
                status,
                created_by,
                rejected_by,
                rejected_at,
                rejection_reason,
                updated_at
            `)
            .eq("id", rejectedPaymentId)
            .single();

        if (updatedPaymentError) {
            console.error(
                "Fetch rejected payment error:",
                updatedPaymentError
            );

            return res.status(500).json({
                success: false,
                message:
                    "Payment was rejected but updated payment could not be fetched",
            });
        }


        return res.status(200).json({
            success: true,
            message: "Payment rejected successfully",
            payment: updatedPayment,
        });

    } catch (error) {
        console.error(
            "Reject admin collection exception:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const reversePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reversal_reason } = req.body;

        // Validate payment ID
        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required",
            });
        }

        // Validate reversal reason
        if (
            !reversal_reason ||
            typeof reversal_reason !== "string" ||
            !reversal_reason.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Reversal reason is required",
            });
        }

        // Call database function
        const {
            data: reversedPaymentId,
            error: reversalError,
        } = await supabase.rpc("reverse_payment", {
            p_payment_id: paymentId,
            p_reversed_by: req.user.id,
            p_reversal_reason: reversal_reason.trim(),
        });

        if (reversalError) {
            console.error(
                "Reverse payment RPC error:",
                reversalError
            );

            return res.status(400).json({
                success: false,
                message: reversalError.message,
            });
        }

        // Fetch updated payment
        const {
            data: payment,
            error: paymentError,
        } = await supabase
            .from("payments")
            .select(`
                id,
                customer_id,
                account_id,
                amount,
                payment_date,
                status,
                created_by,
                approved_by,
                rejected_by,
                reversed_by,
                approved_at,
                rejected_at,
                reversed_at,
                rejection_reason,
                reversal_reason,
                receipt_number,
                updated_at
            `)
            .eq("id", reversedPaymentId)
            .single();

        if (paymentError || !payment) {
            console.error(
                "Fetch reversed payment error:",
                paymentError
            );

            return res.status(500).json({
                success: false,
                message: "Payment reversed but failed to fetch updated payment",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment reversed successfully",
            payment,
        });

    } catch (error) {
        console.error(
            "Reverse payment exception:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    approveAdminCollection,
    rejectAdminCollection,
    reversePayment,
};