import './App.css';
import React, { useState, useEffect } from 'react';

export default function App() {
  const [tvChannels, setTvChannels] = useState([]);

  useEffect(() => {
      const fetchTvProgram = async () => {
          try {
              const response = await fetch('https://api.codetabs.com/v1/proxy?quest=tv24.lt');
              const text = await response.text();
              
              // Parse the HTML
              const parser = new DOMParser();
              const doc = parser.parseFromString(text, 'text/html');

              // Extract channel information
              const channels = Array.from(doc.querySelectorAll('.schedule')).map(channel => {
                  return {
                      name: channel.querySelector('.front-channel-icon').textContent || "unknown",
                      logo: channel.querySelector('img').src,
                      title: channel.querySelector('.item-label a')?.textContent || "unknown",
                      time: channel.querySelector('.item-time')?.textContent || "no time",
                  };
              });

              // Update state with extracted channels
              setTvChannels(channels);

          } catch (error) {
              console.error('Error fetching TV program:', error);

          }
      };

      fetchTvProgram();
  }, []);

  return (
      <div>
          <h1>Test</h1>
          <ul>
              {tvChannels.map((channel, index) => (
                  <li key={index}>
                      <img src={channel.logo} alt={channel.name} />
                      <span>{channel.name}</span>
                      <p>{channel.time} {channel.title}</p>
                  </li>
              ))}
          </ul>
      </div>
  );
}
