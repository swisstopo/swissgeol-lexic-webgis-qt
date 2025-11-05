import { Layer } from '../slice/layerMenuSlice';

/**
   * Function to parse XML document and get feature data
   *
   * @param xmlText fetures in xml format
   * @returns features ready for inclusion in the DOM
   */
export function parseXMLAndGetFeatureData(xmlText: string, layers: Layer[]) {    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const featuresData: any[] = [];

    const nsGML = "http://www.opengis.net/gml";
    const featureMembers = xmlDoc.getElementsByTagNameNS(
      nsGML,
      "featureMember"
    );
    if (featureMembers.length > 0) {
      Array.from(featureMembers).forEach((fm: Element) => {
        const featureEl = fm.firstElementChild;
        if (!featureEl) return;

        const layerName = featureEl.localName; // es. "gc_bedrock"
        const layerObj = layers.find((l) => l.id === layerName);
        const canFilter = layerObj ? layerObj.canFilter : false;

        const featureData: any = {
          LayerName: layerName,
          CanFilter: canFilter,
        };

        Array.from(featureEl.children).forEach((child) => {
          const key = child.localName; 
          if (key === 'geom' || key === 'id' || key === 'color_id') return; // ignore geom, id, and color_id

          let value = child.textContent ?? "";
          featureData[key] = value;
        });

        featuresData.push(featureData);
      });
      return featuresData;
    }

    return [];
  };
