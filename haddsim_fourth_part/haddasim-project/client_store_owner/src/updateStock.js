export async function checkout(json_buy) {

    const response = await fetch('http://localhost:3000/placeorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: json_buy }),
    });
    const result=await response.json();
    if (response.ok) {
        console.log(result.message);
    }
    else
       { console.log(result.error)}

}
checkout({ "bla":2})