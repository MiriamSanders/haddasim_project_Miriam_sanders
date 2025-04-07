export async function checkout(json_buy) {

    const response = await fetch('http://localhost:3000/placeorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: json_buy }),
    });

}