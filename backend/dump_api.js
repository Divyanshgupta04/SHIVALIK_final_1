const axios = require('axios');
const fs = require('fs');

async function dumpApi() {
    try {
        const res = await axios.get('http://localhost:5004/api/products');
        fs.writeFileSync('api_dump.json', JSON.stringify(res.data, null, 2));
        console.log('Dumped API to api_dump.json');
    } catch (err) {
        console.error(err);
    }
}

dumpApi();
