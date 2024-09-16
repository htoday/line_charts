// src/App.tsx

import React, { useEffect, useState } from 'react';
import CustomLineChart from './LineChart';

interface DataPoint {
  timestamp: string;
  values: { [key: number]: number }; // 32 个数据点，每个数据点都有一个值
}

const App: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // 创建 WebSocket 连接
    const ws = new WebSocket('ws://localhost:8080');
    setSocket(ws);

    ws.onmessage = (event) => {
      try {
        // 解析 JSON 数据
        const newValues = JSON.parse(event.data) as { [key: string]: number };
        const newTimestamp = new Date().toISOString();

        // 更新数据状态
        setData(prevData => [...prevData, { timestamp: newTimestamp, values: newValues }]);
      } catch (error) {
        console.error('Error parsing JSON data:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // 创建32个图表所需的数据
  const chartData = Array.from({ length: 32 }, (_, index) => {
    return data.map(dp => ({
      timestamp: dp.timestamp,
      value: dp.values[index + 1] || 0, // 对应图表的值
    }));
  });

  return (
      <div>
        <h1>实时折线图</h1>
        {chartData.map((data, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <h2>图表 {index + 1}</h2>
              <CustomLineChart data={data} />
            </div>
        ))}
      </div>
  );
};

export default App;
