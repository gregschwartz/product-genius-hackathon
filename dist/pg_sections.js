function isValidSectionRule(rule) {
  if (rule.type === 'section_update') {
    return (
      rule.action === 'update' &&
      rule.sections.length > 0 &&
      rule.actionTarget.length > 0
    );
  }
  if (rule.type === 'section_append') {
    return (
      (rule.action === 'push' || rule.action === 'unshift') &&
      rule.sections.length > 0 &&
      rule.actionTarget.length > 0
    );
  }
  return false;
}

async function getPathURL(urlPath) {
  if (!urlPath) {
    return window.location.pathname;
  }
  if (urlPath === 'COLLECTION_X') {
    const queryParams = new URLSearchParams(window.location.search);
    const collection = queryParams.get('collectionX');
    const organization = window.pgSectionsConfig?.organization;
    if (organization && collection) {
      const URL = `https://app.productgenius.io/shopify/api/get_collection_url/${organization}/${collection}`
      const response = await fetch(URL);
      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    }
    return '';
  }
  return urlPath;
}

function dispatchDomActionUpdate(rule, sectionHtml) {
  const actionTarget = document.querySelector(rule.actionTarget);
  if (actionTarget) {
    const sectionNode = document.createElement('div');
    sectionNode.innerHTML = sectionHtml;
    const sectionNodeElement = sectionNode.querySelector(rule.actionTarget);
    if (sectionNodeElement) {
      actionTarget.innerHTML = sectionNodeElement.innerHTML;
    }
  }
}

function dispatchDomActionAppend(rule, sectionHtml) {
  const actionTarget = document.querySelector(rule.actionTarget);
  if (actionTarget) {
    const sectionNode = document.createElement('div');
    sectionNode.innerHTML = sectionHtml;
    let sectionNodeElement = null;

    if (rule.actionSelectors.length > 0) {
      sectionNodeElement = document.createElement('div');
      for (let i = 0; i < rule.actionSelectors.length; i++) {
        const childNode = sectionNode.querySelector(rule.actionSelectors[i]);
        if (childNode) {
          sectionNodeElement.appendChild(childNode);
        }
      }
    } else {
      sectionNodeElement = sectionNode;
    }
    if (sectionNodeElement) {
      if (rule.action === 'unshift') {
        actionTarget.prepend(sectionNodeElement);
      } else {
        actionTarget.appendChild(sectionNodeElement);
      }
    }
  }
}

function dispatchDomAction(rule, response) {
  rule.sections.forEach((section) => {
    const sectionHtml = response[section];
    if (sectionHtml) {
      if (rule.action === 'update') {
        dispatchDomActionUpdate(rule, sectionHtml);
      } else if (rule.action === 'push' || rule.action == 'unshift') {
        dispatchDomActionAppend(rule, sectionHtml);
      }
    }
  });
}

async function dispatchSectionRule(rule) {
  if (isValidSectionRule(rule)) {
    try {
      const urlPath = await getPathURL(rule.urlPath);
      if (!urlPath) {
        return;
      }
      const response = await fetch(
        `${urlPath}?sections=${rule.sections.join(',')}`
      ).then((res) => res.json());
      if (response) {
        dispatchDomAction(rule, response);
      }
    } catch (error) {
      console.error('Error fetching sections', error);
    }
  }
}

if (window.pgSectionsConfig && window.pgSectionsConfig.status === 'initial') {
  const sectionsCfg = window.pgSectionsConfig;
  if (sectionsCfg.enabled && sectionsCfg.rules) {
    window.pgSectionsConfig.status = 'loading';
    sectionsCfg.rules.forEach(async (rule) => {
      await dispatchSectionRule(rule);
    });
    window.pgSectionsConfig.status = 'loaded';
  }
} 