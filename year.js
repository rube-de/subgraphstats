const { request } = require('graphql-request');

// const endpoint1 = 'https://gateway-arbitrum.network.thegraph.com/api/<key>/subgraphs/id/2ZoJCp4S7YP7gbYN2ndsYNjPeZBV1PMti7BBoPRRscNq';
const endpoint1 = 'https://api.studio.thegraph.com/query/65310/brokerbot/version/latest';
const endpoint2 = 'https://api.studio.thegraph.com/query/65310/brokerbot-optimism/version/latest';


// Define your GraphQL query
const query = `
{
  registries(first: 5) {
    id
    marketCount
    tokenCount
    txCount
    totalVolumeUSD
    totalValueLockedCHF
    totalValueLockedUSD
  }
  aktionariatWeekDatas(first: 52, orderBy: date, orderDirection: desc) {
    date
    volumeCHF
    volumeUSD
    txCount
  }
}   
`;

// Function to calculate averages for an endpoint
async function calculateAverages(endpoint, query) {
  try {
    // Send the GraphQL request
    const data = await request(endpoint, query);

    const registriesData = data.registries;
    const aktionariatData = data.aktionariatWeekDatas;

    // Calculate the sum of volumeUSD and txCount
    const totalVolumeUSD = aktionariatData.reduce((total, entry) => total + Number(entry.volumeUSD), 0);
    const totalTxCount = aktionariatData.reduce((total, entry) => total + Number(entry.txCount), 0);

    // Calculate the average
    const averageVolumeUSD = totalVolumeUSD / aktionariatData.length;
    const averageTxCount = totalTxCount / aktionariatData.length;

    // Calculate the total values from the registries entity
    const totalValueLockedUSD = registriesData.reduce((total, entry) => total + Number(entry.totalValueLockedUSD), 0);
    const totalVolumeUSDFromRegistries = registriesData.reduce((total, entry) => total + Number(entry.totalVolumeUSD), 0);

    console.log(`Endpoint: ${endpoint}`);
    console.log('Average Weekly volumeUSD:', averageVolumeUSD);
    console.log('Average Weekly txCount:', averageTxCount);
    console.log('Total totalValueLockedUSD:', totalValueLockedUSD);
    console.log('Total totalVolumeUSD from registries:', totalVolumeUSDFromRegistries);
    console.log("=========================================================");


    // Return the averages and totals as an object
    return { averageVolumeUSD, averageTxCount, totalValueLockedUSD, totalVolumeUSDFromRegistries };
  } catch (error) {
    console.error('Error:', error);
  }
}

// Execute the function for each endpoint and collect the promises
const promises = [calculateAverages(endpoint1, query), calculateAverages(endpoint2, query)];

// Use Promise.all to wait for both promises to resolve
Promise.all(promises)
  .then((averages) => {
    const [averages1, averages2] = averages;
    
    // Calculate the total averages
    const totalAverageVolumeUSD = (averages1.averageVolumeUSD + averages2.averageVolumeUSD) / 2;
    const totalAverageTxCount = (averages1.averageTxCount + averages2.averageTxCount) / 2;

    // Calculate the total values
    const totalTotalValueLockedUSD = averages1.totalValueLockedUSD + averages2.totalValueLockedUSD;
    const totalTotalVolumeUSDFromRegistries = parseFloat(averages1.totalVolumeUSDFromRegistries) + parseFloat(averages2.totalVolumeUSDFromRegistries);

    console.log('Total Average Weekly volumeUSD (across both endpoints):', totalAverageVolumeUSD);
    console.log('Total Average Weekly txCount (across both endpoints):', totalAverageTxCount);
    console.log('Total totalValueLockedUSD (across both endpoints):', totalTotalValueLockedUSD);
    console.log('Total totalVolumeUSD  (across both endpoints):', totalTotalVolumeUSDFromRegistries);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

