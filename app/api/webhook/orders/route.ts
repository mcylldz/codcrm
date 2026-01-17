import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Validation regex
const PHONE_REGEX = /^5\d{9}$/;

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sourceId = searchParams.get('source_id');

        let body = await request.json();
        console.log('Incoming order:', body);

        // Override product if source_id is present
        if (sourceId) {
            const { data: source } = await supabaseAdmin
                .from('webhook_sources')
                .select('*, products(name)')
                .eq('id', sourceId)
                .single();

            if (source && source.products) {
                console.log(`Overriding product to ${source.products.name} from source ${source.name}`);
                body.product = source.products.name;
            }
        }

        const {
            name, surname, phone, address, city, district,
            product, package_id, payment_method, timestamp,
            ab_test_variation, order_source, total_price,
            base_price, shipping_cost, payment_status
        } = body;

        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!phone) missingFields.push('phone');
        if (!product) missingFields.push('product');
        if (package_id === undefined) missingFields.push('package_id');

        if (missingFields.length > 0) {
            return NextResponse.json({ success: false, error: `Missing fields: ${missingFields.join(', ')}` }, { status: 400 });
        }

        // Phone validation
        if (!PHONE_REGEX.test(phone)) {
            return NextResponse.json({ success: false, error: 'Invalid phone format. Must match ^5\\d{9}$' }, { status: 400 });
        }

        // 2. Product/Stock Logic
        // Check if product exists
        const pkgAmount = parseInt(package_id); // package_id is amount
        if (isNaN(pkgAmount) || pkgAmount < 1) {
            return NextResponse.json({ success: false, error: 'Invalid package_id (amount)' }, { status: 400 });
        }

        // Get product
        let { data: prod, error: prodError } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('name', product)
            .single();

        if (prodError && prodError.code !== 'PGRST116') { // PGRST116 is 'Row not found'
            console.error('Product check error:', prodError);
            return NextResponse.json({ success: false, error: 'Database error checking product' }, { status: 500 });
        }

        if (!prod) {
            // Create new product
            const { data: newProd, error: createError } = await supabaseAdmin
                .from('products')
                .insert({ name: product, stock: 0 })
                .select()
                .single();

            if (createError) {
                console.error('Product create error:', createError);
                return NextResponse.json({ success: false, error: 'Failed to create new product' }, { status: 500 });
            }
            prod = newProd;
        }

        // Check stock
        // DISABLED: allow negative stock
        // if (prod.stock < pkgAmount) {
        //    return NextResponse.json({ success: false, error: `Insufficient stock. Current: ${prod.stock}, Requested: ${pkgAmount}` }, { status: 400 });
        // }

        // Deduct stock (allow negative)
        const { error: updateStockError } = await supabaseAdmin
            .from('products')
            .update({ stock: prod.stock - pkgAmount })
            .eq('id', prod.id);

        if (updateStockError) {
            console.error('Stock update error:', updateStockError);
            return NextResponse.json({ success: false, error: 'Failed to update stock' }, { status: 500 });
        }

        // 3. Create Order
        const { data: orderData, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                name,
                surname,
                phone,
                address,
                city,
                district,
                product,
                package_id: pkgAmount,
                payment_method,
                order_timestamp: timestamp, // Mapping timestamp -> order_timestamp
                ab_test_variation,
                order_source,
                total_price: parseFloat(total_price),
                base_price: parseFloat(base_price),
                shipping_cost: parseFloat(shipping_cost),
                payment_status,
                status: 'teyit_bekleniyor'
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order insert error:', orderError);
            // Attempt rollback
            await supabaseAdmin.from('products').update({ stock: prod.stock }).eq('id', prod.id);

            return NextResponse.json({ success: false, error: `Order creation failed: ${orderError.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, order_id: orderData.id }, { status: 200 });

    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
