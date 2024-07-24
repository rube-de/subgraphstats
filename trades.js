const { request } = require('graphql-request');

const endpoint1 = 'https://api.studio.thegraph.com/query/65310/brokerbot/version/latest';
const endpoint2 = 'https://api.studio.thegraph.com/query/65310/brokerbot-optimism/version/latest';


// Define your GraphQL query
const query = `
{
  swaps(first: 100) {
    amountUSD
    amountCHF
  }
}   
`;

// Function to fetch data and calculate averages
async function fetchAndCalculateAverages(endpoint) {
  try {
    const data = await request(endpoint, query);
    const swaps = data.swaps;

    // Calculate the sum of amountUSD and amountXCHF
    const totalAmountUSD = swaps.reduce((total, swap) => total + Number(swap.amountUSD), 0);
    const totalAmountCHF = swaps.reduce((total, swap) => total + Number(swap.amountCHF), 0);

    // Calculate the average amount per swap
    const averageAmountUSD = totalAmountUSD / swaps.length;
    const averageAmountCHF = totalAmountCHF / swaps.length;

    console.log(`Endpoint: ${endpoint}`);
    console.log('Average amountUSD per swap:', averageAmountUSD);
    console.log('Average amountCHF per swap:', averageAmountCHF);
    console.log("=========================================================");

    return { averageAmountUSD, averageAmountCHF };
  } catch (error) {
    console.error(`Error for endpoint ${endpoint}:`, error);
    return { averageAmountUSD: 0, averageAmountCHF: 0 };
  }
}

// Execute the function for both endpoints and collect the results
Promise.all([
  fetchAndCalculateAverages(endpoint1),
  fetchAndCalculateAverages(endpoint2)
]).then((results) => {
  const [averages1, averages2] = results;

  // Calculate the total averages across both endpoints
  const totalAverageAmountUSD = (averages1.averageAmountUSD + averages2.averageAmountUSD) / 2;
  const totalAverageAmountCHF = (averages1.averageAmountCHF + averages2.averageAmountCHF) / 2;

  console.log('Total Average amountUSD (across both endpoints):', totalAverageAmountUSD);
  console.log('Total Average amountCHF (across both endpoints):', totalAverageAmountCHF);
});