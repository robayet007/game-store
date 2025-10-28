class PaymentController {
    paymet_create = async (req, res) => {
        try {
            console.log('🚀 bKash Payment Endpoint HIT!');
            console.log('📨 Request received at:', new Date().toISOString());
            
            // Check if body exists
            if (!req.body) {
                console.log('❌ No request body received');
                return res.status(400).json({
                    success: false,
                    message: 'No request body received'
                });
            }

            const { totalAmount, id } = req.body;
            
            console.log('💰 Received Total Amount:', totalAmount);
            console.log('🆔 Received Product ID:', id);

            // Validate required fields
            if (!totalAmount || !id) {
                console.log('❌ Missing required fields');
                return res.status(400).json({
                    success: false,
                    message: 'Total amount and product ID are required'
                });
            }

            // Success response
            const responseData = {
                success: true,
                message: 'bKash payment received successfully!',
                receivedAmount: totalAmount,
                receivedProductId: id,
                timestamp: new Date().toISOString()
            };

            console.log('✅ Sending response:', responseData);
            res.status(200).json(responseData);

        } catch (error) {
            console.error('❌ Payment Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    };
}

export default new PaymentController();