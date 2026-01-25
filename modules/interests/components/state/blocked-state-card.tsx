"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Estado de bloqueio total do form.
 * Usaremos quando o produto exigir "sem backend, sem cadastro".
 */
export function BlockedStateCard(props: { onTryAgain: () => void }) {
  return (
    <Card className="mt-4 rounded-2xl p-4">
      <Alert>
        <AlertTitle>Sistema indisponível</AlertTitle>
        <AlertDescription>
          Não foi possível consultar seus dados agora. Procure a organização ou tente novamente
          mais tarde.
        </AlertDescription>
      </Alert>

      <Button className="mt-4 w-full" variant="secondary" onClick={props.onTryAgain}>
        Tentar novamente
      </Button>
    </Card>
  );
}
