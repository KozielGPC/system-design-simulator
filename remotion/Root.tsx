import React from 'react';
import { Composition } from 'remotion';
import { PromotionalVideo } from './PromotionalVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromotionalVideo"
        component={PromotionalVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          appUrl: 'http://localhost:5173',
          useScreenshots: true,
        }}
      />
    </>
  );
};
