import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  const [cryptoData, setCryptoData] = useState({});
  const [fiatData, setFiatData] = useState({});
  const [cryptoChange, setCryptoChange] = useState({});
  const [cryptoFavorites, setCryptoFavorites] = useState([]);
  const [fiatFavorites, setFiatFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price",
          {
            params: {
              ids: "bitcoin,ethereum,binancecoin,cardano,solana,ripple,polkadot,dogecoin",
              vs_currencies: "brl",
              include_24hr_change: "true",
            },
          }
        );
        setCryptoData(response.data);

        const changeData = {};
        Object.keys(response.data).forEach((key) => {
          changeData[key] = response.data[key].brl_24h_change || 0;
        });
        setCryptoChange(changeData);
      } catch (error) {
        console.error("Erro ao buscar dados das moedas digitais:", error);
      }
    };

    const fetchFiatData = async () => {
      try {
        const response = await axios.get(
          "https://v6.exchangerate-api.com/v6/c90d0b3244f73831a4ff12b2/latest/BRL"
        );
        setFiatData(response.data);
        setLoading(false);
        console.log("Loading  é false");
      } catch (error) {
        console.error("Erro ao buscar dados das moedas fiduciárias:", error);
      }
    };

    const loadFavorites = async () => {
      try {
        const cryptoFavs = await AsyncStorage.getItem("cryptoFavorites");
        const fiatFavs = await AsyncStorage.getItem("fiatFavorites");
        if (cryptoFavs) {
          setCryptoFavorites(JSON.parse(cryptoFavs));
        }
        if (fiatFavs) {
          setFiatFavorites(JSON.parse(fiatFavs));
        }
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
      }
    };

    fetchCryptoData();
    fetchFiatData();
    loadFavorites();
  }, []);

  const toggleFavorite = async (key, type) => {
    if (type === "crypto") {
      let updatedFavorites;
      if (cryptoFavorites.includes(key)) {
        updatedFavorites = cryptoFavorites.filter((fav) => fav !== key);
      } else {
        updatedFavorites = [...cryptoFavorites, key];
      }
      setCryptoFavorites(updatedFavorites);
      await AsyncStorage.setItem(
        "cryptoFavorites",
        JSON.stringify(updatedFavorites)
      );
    } else if (type === "fiat") {
      let updatedFavorites;
      if (fiatFavorites.includes(key)) {
        updatedFavorites = fiatFavorites.filter((fav) => fav !== key);
      } else {
        updatedFavorites = [...fiatFavorites, key];
      }
      setFiatFavorites(updatedFavorites);
      await AsyncStorage.setItem(
        "fiatFavorites",
        JSON.stringify(updatedFavorites)
      );
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) {
      return styles.positiveChange;
    } else if (change < 0) {
      return styles.negativeChange;
    } else {
      return styles.noChange;
    }
  };

  const sortedCryptoData = Object.keys(cryptoData).sort((a, b) => {
    if (cryptoFavorites.includes(a) && !cryptoFavorites.includes(b)) return -1;
    if (!cryptoFavorites.includes(a) && cryptoFavorites.includes(b)) return 1;
    return 0;
  });

  const sortedFiatData = fiatData.conversion_rates
    ? Object.keys(fiatData.conversion_rates).sort((a, b) => {
        if (fiatFavorites.includes(a) && !fiatFavorites.includes(b)) return -1;
        if (!fiatFavorites.includes(a) && fiatFavorites.includes(b)) return 1;
        return 0;
      })
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moedas Digitais (em BRL)</Text>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#202020" />
        </View>
      ) : (
        <View style={{ height: "30%", marginBottom: 15 }}>
          <ScrollView>
            {sortedCryptoData.map((key) => (
              <View key={key} style={styles.itemContainer}>
                <View style={styles.itemRow}>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(key, "crypto")}
                  >
                    <Text
                      style={
                        cryptoFavorites.includes(key)
                          ? styles.favoriteFilled
                          : styles.favorite
                      }
                    >
                      {cryptoFavorites.includes(key) ? "★" : "☆"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.itemName}>{key.toUpperCase()}</Text>
                </View>
                <Text style={styles.itemValue}>
                  R${cryptoData[key].brl}{" "}
                  {cryptoChange[key] && (
                    <Text style={getChangeColor(cryptoChange[key])}>
                      ({cryptoChange[key] > 0 ? "+" : ""}
                      {cryptoChange[key].toFixed(2)}%)
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      <Text style={styles.title}>Moedas Fiduciárias (em BRL)</Text>
      {loading ? ( // Mostra o ActivityIndicator enquanto os dados estão sendo carregados
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#202020" />
        </View>
      ) : (
        <View>
          <ScrollView>
            {sortedFiatData.map((key) => (
              <View key={key} style={styles.itemContainer}>
                <View style={styles.itemRow}>
                  <TouchableOpacity onPress={() => toggleFavorite(key, "fiat")}>
                    <Text
                      style={
                        fiatFavorites.includes(key)
                          ? styles.favoriteFilled
                          : styles.favorite
                      }
                    >
                      {fiatFavorites.includes(key) ? "★" : "☆"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.itemName}>{key}</Text>
                </View>
                <Text style={styles.itemValue}>
                  {fiatData.conversion_rates[key].toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 35,
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemValue: {
    fontSize: 16,
  },
  positiveChange: {
    color: "green",
  },
  negativeChange: {
    color: "red",
  },
  noChange: {
    color: "gray",
  },
  favorite: {
    fontSize: 24,
    color: "gray",
    marginRight: 10,
  },
  favoriteFilled: {
    fontSize: 24,
    color: "gold",
    marginRight: 10,
  },
});

export default App;
