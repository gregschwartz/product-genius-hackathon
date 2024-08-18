// @flow
import React from 'react';
import type { Node } from 'react';

// $FlowIgnore
import './appLogo.scss';

type AppLogoProps = {
  type: 'dark' | 'light' | 'gray' | 'chat',
};

function AppLogo({ type }: AppLogoProps): Node {
  if (type === 'chat') {
    return (
      <div
        className="pg-app-logo"
        style={{
          width: 25,
          height: 28,
          backgroundImage:
            'url(https://firebasestorage.googleapis.com/v0/b/gamalon-emailabz-integration.appspot.com/o/__GLOBAL%2Fimages%2Fpg%2Fpg-logo-chat.png?alt=media&token=a19f9907-a41f-4228-b744-2e6b25b79b5f)',
        }}
      />
    );
  }
  if (type === 'dark') {
    return (
      <div
        className="pg-app-logo"
        style={{
          width: 16,
          height: 18,
          backgroundImage:
            'url(https://firebasestorage.googleapis.com/v0/b/gamalon-emailabz-integration.appspot.com/o/__GLOBAL%2Fimages%2Fpg%2Fpg-logo-small-dark.png?alt=media&token=e630625c-f75b-4b4a-83cc-a72100f8999e)',
        }}
      />
    );
  }
  if (type === 'light') {
    return (
      <div
        className="pg-app-logo"
        style={{
          width: 16,
          height: 18,
          backgroundImage:
            'url(https://firebasestorage.googleapis.com/v0/b/gamalon-emailabz-integration.appspot.com/o/__GLOBAL%2Fimages%2Fpg%2Fpg-logo-small-light.png?alt=media&token=512b56eb-c507-4774-9eef-dd43098c9c0f)',
        }}
      />
    );
  }
  if (type === 'gray') {
    return (
      <div
        className="pg-app-logo"
        style={{
          width: 22,
          height: 25,
          backgroundImage:
            'url(https://firebasestorage.googleapis.com/v0/b/gamalon-emailabz-integration.appspot.com/o/__GLOBAL%2Fimages%2Fpg%2Fpg-logo-small-gray.png?alt=media&token=4953c4c8-73d6-4649-b60b-f59fc5e90dbb)',
        }}
      />
    );
  }
  return null;
}

export default AppLogo;
