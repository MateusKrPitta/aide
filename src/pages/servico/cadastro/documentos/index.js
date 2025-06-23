import React, { useState } from "react";
import ButtonComponent from "../../../../components/button";
import { AddCircleOutlineOutlined, Article } from "@mui/icons-material";
import ButtonClose from "../../../../components/buttons/button-close";

const DocumentosAtendimento = () => {
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  return (
    <div className="flex w-full flex-col gap-4">
      {/* Input para upload de arquivos */}
      <input
        type="file"
        id="document-upload"
        accept=".pdf"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files);
          setSelectedDocuments((prev) => [
            ...prev,
            ...files.map((file) => ({
              name: file.name,
              file: file,
            })),
          ]);
        }}
      />
      <div className="w-full md:w-[40%]">
        <ButtonComponent
          startIcon={<AddCircleOutlineOutlined fontSize="small" />}
          title={"Adicionar Documentos"}
          subtitle={"Adicionar Documentos"}
          buttonSize="large"
          onClick={() => document.getElementById("document-upload").click()}
        />
      </div>
      <div className="flex flex-col w-[95%] gap-2 mt-2">
        {selectedDocuments.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 border border-primary rounded"
          >
            <div className="flex items-center gap-2">
              <Article fontSize="small" />
              <label className="text-xs">{doc.name}</label>
            </div>
            <ButtonClose
              funcao={() => {
                setSelectedDocuments((prev) =>
                  prev.filter((_, i) => i !== index)
                );
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentosAtendimento;
