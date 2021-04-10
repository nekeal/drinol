import React, { FunctionComponent, Fragment } from "react";
import { useTranslation, Trans } from "react-i18next";

import styles from "./ExampleComponent.module.scss";

export const ExampleComponent: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <h2 className={styles.example}>{t("TITLE")}</h2>
      <div>
        <Trans i18nKey="DESCRIPTION.PART_1">
          To get started, edit <code>src/App.js</code> and save to reload.
        </Trans>
      </div>
    </Fragment>
  );
};
