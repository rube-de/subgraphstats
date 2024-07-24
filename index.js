const { request } = require('graphql-request');

const endpoint1 = 'https://api.thegraph.com/subgraphs/name/aktionariat/brokerbot';
const endpoint2 = 'https://api.thegraph.com/subgraphs/name/aktionariat/brokerbot-optimism';


// Get the current date
const currentDate = new Date();

// Calculate the date 90 days ago
const ninetyDaysAgo = new Date(currentDate);
ninetyDaysAgo.setDate(currentDate.getDate() - 90);

// Get the timestamp (milliseconds since Unix epoch) for the date 90 days ago
const timestamp = Math.floor(ninetyDaysAgo.getTime() / 1000);

const variables = {
  timestamp: timestamp
}
console.log(timestamp);

// Define your GraphQL query
const query = `
query GetAktionariatData($timestamp: Int!) {
  registries(first: 5) {
    id
    marketCount
    tokenCount
    txCount
    totalVolumeUSD
    totalValueLockedXCHF
    totalValueLockedUSD
  }
  aktionariatDayDatas(first: 100, orderBy: date, orderDirection: desc, where: {date_gt: $timestamp}) {
    date
    volumeXCHF
    volumeUSD
    txCount
  }
}   
`;

// Function to calculate averages for an endpoint
async function calculateAverages(endpoint, query) {
  try {
    // Send the GraphQL request
    const data = await request(endpoint, query, variables);

    const registriesData = data.registries;
    const aktionariatData = data.aktionariatDayDatas;

    // Calculate the sum of volumeUSD and txCount
    const totalVolumeUSD = aktionariatData.reduce((total, entry) => total + Number(entry.volumeUSD), 0);
    const totalTxCount = aktionariatData.reduce((total, entry) => total + Number(entry.txCount), 0);
    console.log(aktionariatData.length);

    // Calculate the average
    const averageVolumeUSD = totalVolumeUSD / 90;
    const averageTxCount = totalTxCount / 90;

    // Calculate the total values from the registries entity
    const totalValueLockedUSD = registriesData.reduce((total, entry) => total + Number(entry.totalValueLockedUSD), 0);
    const totalVolumeUSDFromRegistries = registriesData.reduce((total, entry) => total + Number(entry.totalVolumeUSD), 0);

    console.log(`Endpoint: ${endpoint}`);
    console.log('Average daily volumeUSD:', averageVolumeUSD);
    console.log('Average daily txCount:', averageTxCount);
    console.log('Total totalValueLockedUSD:', totalValueLockedUSD);
    console.log('Total totalVolumeUSD:', totalVolumeUSDFromRegistries);
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
    console.log(typeof(averages1.totalTotalValueLockedUSD));
    const totalTotalValueLockedUSD = averages1.totalValueLockedUSD + averages2.totalValueLockedUSD;
    const totalTotalVolumeUSDFromRegistries = parseFloat(averages1.totalVolumeUSDFromRegistries) + parseFloat(averages2.totalVolumeUSDFromRegistries);

    console.log('Total Average volumeUSD (across both endpoints):', totalAverageVolumeUSD);
    console.log('Total Average txCount (across both endpoints):', totalAverageTxCount);
    console.log('Total totalValueLockedUSD (across both endpoints):', totalTotalValueLockedUSD);
    console.log('Total totalVolumeUSD (across both endpoints):', totalTotalVolumeUSDFromRegistries);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

