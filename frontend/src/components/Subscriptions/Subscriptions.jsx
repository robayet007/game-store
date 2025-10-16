import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Subscriptions.css';

const Subscriptions = () => {
  const navigate = useNavigate();

  const subscriptionItems = [
    {
      id: 1,
      name: 'Netflix',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png',
      description: 'Premium streaming service',
      price: '৳ 299 - ৳ 1,199',
      route: '/netflix',
      gradient: 'linear-gradient(135deg, #E50914, #B81D24)'
    },
    {
      id: 2,
      name: 'YouTube Premium',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/800px-YouTube_full-color_icon_%282017%29.svg.png',
      description: 'Ad-free videos & music',
      price: '৳ 159 - ৳ 479',
      route: '/youtube-premium',
      gradient: 'linear-gradient(135deg, #FF0000, #CC0000)'
    },
    {
      id: 3,
      name: 'Amazon Prime',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/1200px-Amazon_Prime_Video_logo.svg.png',
      description: 'Movies, TV & shipping',
      price: '৳ 349 - ৳ 999',
      route: '/amazon-prime',
      gradient: 'linear-gradient(135deg, #00A8E1, #007EB9)'
    },
    {
      id: 4,
      name: 'Crunchyroll',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Crunchyroll_Logo.png/1200px-Crunchyroll_Logo.png',
      description: 'Anime streaming platform',
      price: '৳ 199 - ৳ 599',
      route: '/crunchyroll',
      gradient: 'linear-gradient(135deg, #F47521, #D45F0D)'
    },
    {
      id: 5,
      name: 'ExpressVPN',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/ExpressVPN_logo.svg/1200px-ExpressVPN_logo.svg.png',
      description: 'High-speed VPN service',
      price: '৳ 1,299/month',
      route: '/expressvpn',
      gradient: 'linear-gradient(135deg, #DA3943, #B82E37)'
    },
    {
      id: 6,
      name: 'NordVPN',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/NordVPN_logo.svg/1200px-NordVPN_logo.svg.png',
      description: 'Secure VPN connection',
      price: '৳ 999/month',
      route: '/nordvpn',
      gradient: 'linear-gradient(135deg, #4687FF, #2D6CDB)'
    },
    {
      id: 7,
      name: 'Disney+ Hotstar',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Disney%2B_Hotstar_logo.svg/1200px-Disney%2B_Hotstar_logo.svg.png',
      description: 'Disney, Marvel & Star content',
      price: '৳ 199 - ৳ 899',
      route: '/disney-hotstar',
      gradient: 'linear-gradient(135deg, #113CCF, #0B2A9B)'
    },
    {
      id: 8,
      name: 'Spotify',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1200px-Spotify_logo_without_text.svg.png',
      description: 'Music streaming service',
      price: '৳ 129 - ৳ 389',
      route: '/spotify',
      gradient: 'linear-gradient(135deg, #1DB954, #1AA34A)'
    },
    {
      id: 9,
      name: 'HBO Max',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/HBO_Max_Logo.svg/1200px-HBO_Max_Logo.svg.png',
      description: 'HBO originals & movies',
      price: '৳ 499 - ৳ 1,499',
      route: '/hbo-max',
      gradient: 'linear-gradient(135deg, #821BF0, #6A0BC9)'
    },
    {
      id: 10,
      name: 'Apple TV+',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Apple_TV_plus_icon.svg/1200px-Apple_TV_plus_icon.svg.png',
      description: 'Apple original content',
      price: '৳ 399/month',
      route: '/apple-tv',
      gradient: 'linear-gradient(135deg, #000000, #333333)'
    }
  ];

  const handleItemClick = (route) => {
    navigate(route);
  };

  return (
    <div className="subscriptions-container">
      <div className="subscriptions-header">
        <h2 className="subscriptions-title">Gaming Subscriptions</h2>
        <p className="subscriptions-subtitle">Level up your entertainment experience</p>
      </div>
      
      <div className="subscriptions-grid-horizontal">
        {subscriptionItems.map((item) => (
          <div 
            key={item.id}
            className="subscription-card-horizontal"
            onClick={() => handleItemClick(item.route)}
            style={{ '--card-gradient': item.gradient }}
          >
            <div className="card-glow"></div>
            <div className="card-content-horizontal">
              <div className="card-logo-horizontal">
                <img src={item.logo} alt={item.name} />
              </div>
              <div className="card-info-horizontal">
                <h3 className="card-title-horizontal">{item.name}</h3>
                <p className="card-description-horizontal">{item.description}</p>
                <div className="card-price-horizontal">{item.price}</div>
              </div>
              <div className="card-badge">
                <span>Gaming</span>
              </div>
            </div>
            <div className="card-overlay-horizontal">
              <span>Click to Explore</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;