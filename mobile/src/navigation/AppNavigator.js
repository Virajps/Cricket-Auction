
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuctionListScreen from '../screens/AuctionListScreen';
import AuctionDetailsScreen from '../screens/AuctionDetailsScreen';
import TeamListScreen from '../screens/TeamListScreen';
import PlayerListScreen from '../screens/PlayerListScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="AuctionList">
      <Stack.Screen name="AuctionList" component={AuctionListScreen} options={{ title: 'Auctions' }} />
      <Stack.Screen name="AuctionDetails" component={AuctionDetailsScreen} options={{ title: 'Auction Details' }} />
      <Stack.Screen name="TeamList" component={TeamListScreen} options={{ title: 'Teams' }} />
      <Stack.Screen name="PlayerList" component={PlayerListScreen} options={{ title: 'Players' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
