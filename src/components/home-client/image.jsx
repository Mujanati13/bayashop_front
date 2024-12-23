import React from 'react';
import { Carousel } from 'antd';

// Sample images (replace with your actual images)
const images = [
  "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
];

const ImageCarousel = () => {
  return (
    <div className="w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-4xl px-2 sm:px-4 mx-auto">
      <Carousel 
        autoplay 
        dots={true} 
        effect="fade"
        className="rounded-lg sm:rounded-xl overflow-hidden"
      >
        {images.map((src, index) => (
          <div 
            key={index} 
            className="h-48 sm:h-64 md:h-80 lg:h-[380px] w-full"
          >
            <img
              src={src}
              alt={`Prepared dish ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;