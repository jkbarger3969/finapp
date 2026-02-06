const http = require('http');

const query = JSON.stringify({
    query: `
    query {
      __schema {
        mutationType {
          fields {
            name
          }
        }
      }
    }
  `
});

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/graphql',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': query.length
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.errors) {
                console.error('Errors:', result.errors);
                return;
            }
            const mutations = result.data.__schema.mutationType.fields.map((f) => f.name);
            console.log('Available Mutations:', mutations);
            if (mutations.includes('createAccountCard')) {
                console.log('SUCCESS: createAccountCard found.');
            } else {
                console.log('FAILURE: createAccountCard NOT found.');
            }
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Response body:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

req.write(query);
req.end();
