import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const conversionRate = 1666.2; // Conversion rate based on 24hr average. Data pulled from CoinMarketCap on 03/16/2023
  const [blockData, setBlockData] = useState({});

  useEffect(() => {
    getCurrentBlockData();
  }, []);

  async function getCurrentBlockData() {
    // fetch information on the latest block (including transactions)
    const currentBlockRes = await fetch(
      `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "eth_getBlockByNumber",
          params: ["latest", true],
        }),
      }
    );
    const currentBlockData = await currentBlockRes.json();
    setBlockData(currentBlockData.result);
  }

  return (
    <div className="App">
      <h2>Current Block: {parseInt(blockData.number, 16)}</h2>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Value (ETH)</th>
            <th>Value (USD)</th>
          </tr>
        </thead>

        {blockData && blockData.transactions && (
          <tbody>
            {/* Sort and display transactions by transactionIndex */}
            {blockData.transactions
              .sort((a, b) =>
                parseInt(a.transactionIndex, 16) <
                parseInt(b.transactionIndex, 16)
                  ? 1
                  : -1
              )
              .map((transaction) => {
                const ethValue =
                  parseInt(transaction.value, 16) * 0.000000000000000001; // convert wei to ETH
                const usdValue =
                  Math.round(ethValue * conversionRate * 100) / 100; // convert ETH to USD (rounded to two decimal places).

                return (
                  <tr key={transaction.hash}>
                    <td>{transaction.from}</td>
                    <td>{transaction.to}</td>
                    <td>{ethValue} ETH</td>
                    <td>${usdValue}</td>
                  </tr>
                );
              })}
          </tbody>
        )}
      </table>
    </div>
  );
}

export default App;
