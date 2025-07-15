/**
 * @jest-environment jsdom
 */

import { parseXMLAndGetFeatureData } from "../app/utilities/FeatureInfoPopupUtilities";
import { Layer } from "../app/slice/layerMenuSlice";

describe("FeatureInfoPopup – parseXMLAndGetFeatureData", () => {
  it("dovrebbe estrarre correttamente layerName, litstrat_lexic e kind dal GML", () => {
    const sampleGML = `<?xml version="1.0" encoding="UTF-8"?>
      <wfs:FeatureCollection xmlns="http://www.opengis.net/wfs"
                             xmlns:wfs="http://www.opengis.net/wfs"
                             xmlns:gml="http://www.opengis.net/gml"
                             xmlns:swisstopo="https://www.swisstopo.admin.ch">
        <gml:featureMember>
          <swisstopo:gc_bedrock fid="gc_bedrock.123">
            <swisstopo:litstrat_lexic>
              https://lexic.swisstopo.demo.epsilon-italia.it/LithostratigraphicUnits/AlsaceMolasse
            </swisstopo:litstrat_lexic>
            <swisstopo:kind>Rbed Festgestein</swisstopo:kind>
          </swisstopo:gc_bedrock>
        </gml:featureMember>
      </wfs:FeatureCollection>`;

    const layers: Layer[] = [
      {
        id: "gc_bedrock",
        canFilter: false,
        label: "",
        isChecked: false,
        canGetFeatureInfo: true,
      },
    ];

    const result = parseXMLAndGetFeatureData(sampleGML, layers);

    expect(result).toHaveLength(1);

    const row = result[0];
    expect(row.LayerName).toBe("gc_bedrock");
    expect(row.litstrat_lexic.trim()).toBe(
      "https://lexic.swisstopo.demo.epsilon-italia.it/LithostratigraphicUnits/AlsaceMolasse"
    );
    expect(row.kind).toBe("Rbed Festgestein");
  });

  it("dovrebbe tornare array vuoto se non trova né <gml:featureMember> né <Layer>", () => {
    const emptyXML = `<?xml version="1.0" encoding="UTF-8"?>
      <wfs:FeatureCollection xmlns="http://www.opengis.net/wfs"
                             xmlns:gml="http://www.opengis.net/gml">
      </wfs:FeatureCollection>`;

    const result = parseXMLAndGetFeatureData(emptyXML, []);

    expect(result).toEqual([]);
  });

  it("dovrebbe estrarre correttamente da un vecchio XML con <Layer> e <Attribute>", () => {
    const oldStyleXML = `<?xml version="1.0" encoding="UTF-8"?>
      <GetFeatureInfoResponse>
        <Layer title="GC_BEDROCK" name="gc_bedrock">
          <Feature id="1">
            <Attribute name="litstrat_lexic"
                       value="https://lexic.swisstopo.demo.epsilon-italia.it/LithostratigraphicUnits/AlsaceMolasse"/>
            <Attribute name="kind" value="Rbed Festgestein"/>
          </Feature>
        </Layer>
      </GetFeatureInfoResponse>`;

    const layers: Layer[] = [
      {
        id: "gc_bedrock",
        canFilter: false,
        label: "",
        isChecked: false,
        canGetFeatureInfo: true,
      },
    ];

    const result = parseXMLAndGetFeatureData(oldStyleXML, layers);
    expect(result).toHaveLength(1);

    const row = result[0];
    expect(row.LayerName).toBe("gc_bedrock");
    expect(row.litstrat_lexic).toBe(
      "https://lexic.swisstopo.demo.epsilon-italia.it/LithostratigraphicUnits/AlsaceMolasse"
    );
    expect(row.kind).toBe("Rbed Festgestein");
  });
});
