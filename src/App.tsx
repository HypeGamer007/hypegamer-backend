import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/app-shell/AppShell";
import { CompetitionDetailPage } from "@/pages/CompetitionDetailPage";
import { CompetitionsPage } from "@/pages/CompetitionsPage";
import { DataProductsPage } from "@/pages/DataProductsPage";
import { DevelopersPage } from "@/pages/DevelopersPage";
import { EntitiesPage } from "@/pages/EntitiesPage";
import { EntityDetailPage } from "@/pages/EntityDetailPage";
import { HomePage } from "@/pages/HomePage";
import { IdentityPage } from "@/pages/IdentityPage";
import { IntegratorPage } from "@/pages/IntegratorPage";
import { PartnersPage } from "@/pages/PartnersPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TrustPage } from "@/pages/TrustPage";
import { MatchDetailPage } from "@/pages/MatchDetailPage";
import { MatchesPage } from "@/pages/MatchesPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { RootRedirect } from "@/pages/RootRedirect";
import { SearchPage } from "@/pages/SearchPage";
import { SourceDetailPage } from "@/pages/SourceDetailPage";
import { SourcesPage } from "@/pages/SourcesPage";
import { WidgetsPage } from "@/pages/WidgetsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/competitions" element={<CompetitionsPage />} />
          <Route path="/competitions/:competitionId" element={<CompetitionDetailPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/matches/:matchId" element={<MatchDetailPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/sources/:sourceId" element={<SourceDetailPage />} />
          <Route path="/entities" element={<EntitiesPage />} />
          <Route path="/entities/:entityId" element={<EntityDetailPage />} />
          <Route path="/identity" element={<IdentityPage />} />
          <Route path="/data-products" element={<DataProductsPage />} />
          <Route path="/widgets" element={<WidgetsPage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/integrator" element={<IntegratorPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/trust" element={<TrustPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
