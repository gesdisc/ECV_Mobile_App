import React from "react";
import {
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";

import catalog from "./catalog.json";

interface VariablesProps {
  onVariableChange: (value: string) => void;
}

// const AccordionItem = ({ item }) => {
//   return (
//     <IonAccordion value={item.title}>
//       <IonItem slot="header">
//         <IonLabel>{item.title}</IonLabel>
//       </IonItem>
//       <IonList slot="content">
//         {item.items &&
//           item.items.map((subItem, index) => (
//             <AccordionItem key={index} item={subItem} />
//           ))}
//       </IonList>
//     </IonAccordion>
//   );
// };

// const MultilevelAccordion = ({ data }) => {
//   return (
//     <IonAccordionGroup>
//       {data.map((item, index) => (
//         <AccordionItem key={index} item={item} />
//       ))}
//     </IonAccordionGroup>
//   );
// };

const Variables: React.FC<VariablesProps> = ({ onVariableChange }) => {
  // const [expanded, setExpanded] = useState<string>("");
  const handleClick = (value: string) => {
    onVariableChange(value);
  };

  //   const handleItemClick = (value: string) => {
  //     setExpanded(expanded === value ? "" : value);
  //     if (value === "precipitation") {
  //       handleClick();
  //     }
  //   };

  //   const topics = catalog.map((o) => o.topic);
  //   const categories = [...new Set(catalog.map((o) => o.category))];
  //   console.log(topics);
  //   console.log(categories);

  //   const displayCatalog = catalog.map((obj) => {
  //     return (
  //       <IonAccordion key={obj.category} value={key}>
  //         <IonItem slot="header" color="primary">
  //           <IonLabel>{key}</IonLabel>
  //         </IonItem>
  //         <IonList slot="content">
  //           {/* <IonAccordion value={value}>
  //             <IonItem slot="header" color="light">
  //               <IonLabel>First Accordion</IonLabel>
  //             </IonItem>
  //             <IonList slot="content">
  //               <IonItem slot="header" color="light">
  //                 <IonLabel>First Accordion</IonLabel>
  //               </IonItem>
  //               <IonItem slot="header" color="light">
  //                 <IonLabel>First Accordion</IonLabel>
  //               </IonItem>
  //             </IonList>
  //           </IonAccordion> */}
  //         </IonList>
  //       </IonAccordion>
  //     );
  //   });

  return (
    <IonAccordionGroup>
      {/* <IonAccordion value="atmosphere">
        <IonItem slot="header" color="primary">
          <IonLabel>Atmosphere</IonLabel>
        </IonItem>
        <IonList slot="content">
          <IonItem button onClick={() => handleItemClick("precipitation")}>
            <IonLabel>Precipitation</IonLabel>
          </IonItem>
          {expanded === "precipitation" && (
            <IonList>
              <IonItem button onClick={handleClick}>
                <IonLabel>Global Precipitation Measurement</IonLabel>
              </IonItem>
            </IonList>
          )}
          <IonItem>
            <IonLabel>Water Vapor</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Aerosol Properties</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Cloud Properties</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Trace Gases</IonLabel>
          </IonItem>
        </IonList>
      </IonAccordion> */}
    </IonAccordionGroup>
    // <IonAccordionGroup>
    //   <IonAccordion value="Atmosphere">
    //     <IonItem slot="header" color="primary">
    //       <IonLabel>Atmosphere</IonLabel>
    //     </IonItem>
    //     <IonList slot="content">
    //       <IonAccordion value="Precipitation">
    //         <IonItem slot="header" color="light">
    //           <IonLabel>Precipitation</IonLabel>
    //         </IonItem>
    //         <IonList slot="content">
    //           <IonItem color="light">
    //             <IonLabel>Snow</IonLabel>
    //           </IonItem>
    //           <IonItem color="light">
    //             <IonLabel>Rain</IonLabel>
    //           </IonItem>
    //         </IonList>
    //       </IonAccordion>
    //     </IonList>
    //   </IonAccordion>

    //   <IonAccordion value="Ocean">
    //     <IonItem slot="header" color="primary">
    //       <IonLabel>Ocean</IonLabel>
    //     </IonItem>
    //     <IonList slot="content">
    //       <IonAccordion value="Precipitation">
    //         <IonItem slot="header" color="light">
    //           <IonLabel>Precipitation</IonLabel>
    //         </IonItem>
    //         <IonList slot="content">
    //           <IonItem color="light">
    //             <IonLabel>Snow</IonLabel>
    //           </IonItem>
    //           <IonItem color="light">
    //             <IonLabel>Rain</IonLabel>
    //           </IonItem>
    //         </IonList>
    //       </IonAccordion>
    //     </IonList>
    //   </IonAccordion>

    //   <IonAccordion value="Land">
    //     <IonItem slot="header" color="primary">
    //       <IonLabel>Land</IonLabel>
    //     </IonItem>
    //     <IonList slot="content">
    //       <IonAccordion value="Precipitation">
    //         <IonItem slot="header" color="light">
    //           <IonLabel>Precipitation</IonLabel>
    //         </IonItem>
    //         <IonList slot="content">
    //           <IonItem color="light">
    //             <IonLabel>Snow</IonLabel>
    //           </IonItem>
    //           <IonItem color="light">
    //             <IonLabel>Rain</IonLabel>
    //           </IonItem>
    //         </IonList>
    //       </IonAccordion>
    //     </IonList>
    //   </IonAccordion>
    // </IonAccordionGroup>
  );
};

export default Variables;
