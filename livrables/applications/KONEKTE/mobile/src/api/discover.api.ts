import api from "./client";
import { DiscoverProfile, SearchResult } from "../types";

export interface DiscoverFilters {
  page?: number;
  limit?: number;
  minAge?: number;
  maxAge?: number;
  gender?: string;
}

export const fetchDiscoverProfiles = async (filters: DiscoverFilters = {}) => {
  const { data } = await api.get<{ success: boolean; data: DiscoverProfile[] }>("/discover", {
    params: filters,
  });
  return data.data;
};

export const searchProfiles = async (query: string) => {
  const { data } = await api.get<{ success: boolean; data: SearchResult[] }>("/discover/search", {
    params: { query },
  });
  return data.data;
};
