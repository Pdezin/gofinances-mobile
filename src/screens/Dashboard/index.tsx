import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "styled-components";
import { HighlightCard } from "../../components/HighlightCard";
import {
  TransactionCard,
  TransactionCardProps,
} from "../../components/TransactionCard";
import { formatHelper } from "../../utils/format";

import {
  Container,
  Header,
  Photo,
  User,
  UserGreeting,
  UserWrapper,
  UserInfo,
  UserName,
  Icon,
  HighlightCards,
  Title,
  Transactions,
  TransactionList,
  LogoutButton,
  LoadContainer,
} from "./styles";

import { useAuth } from "../../hooks/auth";

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );

  const { signOut, user } = useAuth();

  const theme = useTheme();

  function getLastTransactionDate(
    collection: DataListProps[],
    type: "positive" | "negative"
  ) {
    const transactionsTime = collection
      .filter((transaction) => transaction.type === type)
      .map((transaction) => new Date(transaction.date).getTime());

    if (transactionsTime.length === 0) return "";

    const lastTransaction = new Date(Math.max.apply(Math, transactionsTime));

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString(
      "pt-BR",
      { month: "long" }
    )}`;
  }

  async function loadTransaction() {
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transaction = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transaction
      .sort(
        (a: DataListProps, b: DataListProps) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .map((item: DataListProps) => {
        if (item.type === "positive") {
          entriesTotal += Number(item.amount);
        } else {
          expensiveTotal += Number(item.amount);
        }

        const amount = formatHelper.formatCurrency(item.amount);

        const date = Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        };
      });

    setTransactions(transactionsFormatted);

    const lastTransactionEntries = getLastTransactionDate(
      transaction,
      "positive"
    );

    const lastTransactionExpensives = getLastTransactionDate(
      transaction,
      "negative"
    );

    const totalInterval = lastTransactionExpensives
      ? `01 a ${lastTransactionExpensives}`
      : "";

    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: formatHelper.formatCurrency(entriesTotal),
        lastTransaction: lastTransactionEntries
          ? `Última entrada dia ${lastTransactionEntries}`
          : "",
      },
      expensives: {
        amount: formatHelper.formatCurrency(expensiveTotal),
        lastTransaction: lastTransactionExpensives
          ? `Última saída dia ${lastTransactionExpensives}`
          : "",
      },
      total: {
        amount: formatHelper.formatCurrency(total),
        lastTransaction: totalInterval,
      },
    });

    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadTransaction();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.photo,
                  }}
                />
                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
              type="up"
            />
            <HighlightCard
              title="Saídas"
              amount={highlightData.expensives.amount}
              lastTransaction={highlightData.expensives.lastTransaction}
              type="down"
            />
            <HighlightCard
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
              type="total"
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>
            <TransactionList
              data={transactions}
              keyExtractor={({ id }) => id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
