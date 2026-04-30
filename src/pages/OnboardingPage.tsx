import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useRouteFixture } from "@/hooks/useRouteFixture";

export function OnboardingPage() {
  const fx = useRouteFixture();
  return (
    <RouteViewRoot
      gateAnalyticsId="onboarding"
      status={fx.rawFixture ? fx.status : "ready"}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
    >
      <OnboardingWizard />
    </RouteViewRoot>
  );
}
