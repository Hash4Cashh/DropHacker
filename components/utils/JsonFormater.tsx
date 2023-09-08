
export const JSONFormatterCode = ({ data }: { data: Record<string, any> }) => {
    const formatJSON = (json: any, indent = 0): any => {
      const indentation = " ".repeat(indent * 2);
  
      return Object.entries(json)
        .map(([key, value]) => {
          if (typeof value === "object" && !Array.isArray(value)) {
            return `${indentation}${key}:\n${formatJSON(value, indent + 1)}`;
          } else {
            return `${indentation}${key}: ${JSON.stringify(value)}`;
          }
        })
        .join("\n");
    };
  
    return (
      <pre>
        <code>{formatJSON(data)}</code>
      </pre>
    );
  };
  
  export const JSONFormatter = ({ data }: { data: Record<string, any> }) => {
      const formatJSON = (json: any, indent = 0) => {
        // console.log("*** formatJSON *** ", json)
        return Object.entries(json).map(([key, value], i) => {
          let marginTop = "mt-0";
          if (!indent && i !== 0) marginTop = "mt-1.5";
    
          if (typeof value === "object" && !Array.isArray(value) && value !== null) {
            // console.log("JSON IS OBJECT", key, value);
            return (
              <div key={`${key}-${value}`} className={`${marginTop}`}>
                <div style={{ marginLeft: `${indent * 20}px` }}>
                  <span className="font-semibold">{key}:</span>
                </div>
                <div style={{ marginLeft: `${(indent + 1) * 20}px` }}>
                  {formatJSON(value, indent + 1)}
                </div>
              </div>
            );
          } else {
            // console.log("JSON IS VALUE", key, value);
            return (
              <div
                key={`${key}-${value}`}
                className={`${marginTop}`}
                style={{ marginLeft: `${indent * 20}px` }}
              >
                <span>
                  <span className="font-semibold">{key}:</span>{" "}
                  <span className="text-gray-400">{JSON.stringify(value)}</span>
                </span>
              </div>
            );
          }
        });
      };
    
      return <div className="text-gray-700">{formatJSON(data)}</div>;
    };
    