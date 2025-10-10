import React from "react";
import styled from "styled-components";
import { Header } from "./Header";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const MainContent = styled.main`
  margin-top: 60px;
  height: calc(100vh - 60px);
  position: relative;
`;

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  return (
    <AppContainer>
      <Header title={title} />
      <MainContent>{children}</MainContent>
    </AppContainer>
  );
};
