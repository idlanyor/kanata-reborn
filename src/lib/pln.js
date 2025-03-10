import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://cek-id-pln-pasca-dan-pra-bayar.p.rapidapi.com/pln/56213840202/token_pln',
  headers: {
    'x-rapidapi-key': '827837e666msh7d2c461260f6ad8p172640jsn218cb6bb12db',
    'x-rapidapi-host': 'cek-id-pln-pasca-dan-pra-bayar.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}