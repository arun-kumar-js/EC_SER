/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let component;
  await ReactTestRenderer.act(async () => {
    component = ReactTestRenderer.create(<App />);
  });

  // Ensure component was created successfully
  expect(component).toBeTruthy();
  expect(component.toJSON()).toBeTruthy();
});
