import React from 'react';
import { type CategoryKey } from './types';
import { TrendingUp, Layers, PieChart, BarChart, Globe, Landmark, Package, RefreshCw, Bitcoin, Building2, Repeat2, Coins, Zap, BookOpen, Warehouse } from 'lucide-react';

export const CAT_ICONS: Record<CategoryKey, React.ReactNode> = {
  stock:             <TrendingUp   size={24} />,
  etf:               <Layers       size={24} />,
  portfolio:         <PieChart     size={24} />,
  financial_metrics: <BarChart     size={24} />,
  market_indicators: <Globe        size={24} />,
  bonds:             <Landmark     size={24} />,
  commodities:       <Package      size={24} />,
  forex:             <RefreshCw   size={24} />,
  crypto:            <Bitcoin      size={24} />,
  macro:             <Building2    size={24} />,
  trade:             <Repeat2      size={24} />,
  dividend:          <Coins        size={24} />,
  derivatives:       <Zap          size={24} />,
  funds:             <BookOpen     size={24} />,
  reits:             <Warehouse    size={24} />,
  dynamic:           <Globe        size={24} />,
};

export const CAT_ICONS_SMALL: Record<CategoryKey, React.ReactNode> = {
  stock:             <TrendingUp   size={15} />,
  etf:               <Layers       size={15} />,
  portfolio:         <PieChart     size={15} />,
  financial_metrics: <BarChart     size={15} />,
  market_indicators: <Globe        size={15} />,
  bonds:             <Landmark     size={15} />,
  commodities:       <Package      size={15} />,
  forex:             <RefreshCw   size={15} />,
  crypto:            <Bitcoin      size={15} />,
  macro:             <Building2    size={15} />,
  trade:             <Repeat2      size={15} />,
  dividend:          <Coins        size={15} />,
  derivatives:       <Zap          size={15} />,
  funds:             <BookOpen     size={15} />,
  reits:             <Warehouse    size={15} />,
  dynamic:           <Globe        size={15} />,
};
