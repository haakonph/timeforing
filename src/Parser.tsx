import React, { useState, ChangeEvent } from 'react';
import Papa from 'papaparse';

interface CsvRow {
  Dag: string;
  Dato: string;
  Inn: string;
  Ut: string;
  Timer: string;
  Fleks: string;
  Beskrivelse: string;
  Fra: string;
  Til: string;
  Sum: string;
}

interface Mananged extends CsvRow {
  desimalTimer?: string;
  ukeTimer?: string;
  error?: string
}


export const CsvDisplay: React.FC = () => {
  const [dataBeforeSum, setDataBeforeSum] = useState<Mananged[]>([]);
  const [dataAfterSum, setDataAfterSum] = useState<Mananged[]>([]);
  const [totalTimer, setTotalTimer] = useState("")

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse<CsvRow>(file, {
        header: true,
        delimiter: ';',
        complete: (results) => {

          const data =  results.data;
          const sumIndex = data.findIndex(row => row.Dag === 'Sum');
          const rows = data.slice(0, sumIndex)

          let totalHours = 0;
          let weekHours = 0;

          const timer = rows.map((row, index, array) => {
            const desimalTimer = timerDesimal(row.Timer);

            if (desimalTimer) {
              weekHours += desimalTimer;
              totalHours += desimalTimer;
            }
            let ukeTimer: string | undefined = undefined
            if (row.Dag === 'Søndag' || index === array.length - 1) {
             ukeTimer = weekHours.toFixed(2);
              weekHours = 0;
            }

            return {
              ...row,
              desimalTimer: desimalTimer?.toFixed(2),
              ukeTimer,
              error: row.Inn && !row.Ut || !row.Inn && row.Ut ? 'Feil med inn/ut' : undefined
            }
          });
          setDataBeforeSum(timer);
          setDataAfterSum(data.slice(sumIndex));
          setTotalTimer(totalHours.toFixed(2));
        }
      });
    }
  };

  return (
    <div>
      <input type="file" accept=".csv, .txt" onChange={handleFileUpload}/>
      <div>
        {dataAfterSum.length === 1 && <>
          <p>total fra csv: {dataAfterSum[0].Sum} kommaMinutter {(parseInt(dataAfterSum[0].Sum.split(":")[1])/60).toFixed(2)}</p>
          <p>total fra omregnet: {totalTimer}</p>
        </>}
      </div>
      {dataBeforeSum.length > 0 && (
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
          <tr>
            <th>Inn</th>
            <th>Ut</th>
            <th>Timer</th>
            <th>Dag</th>
            <th>Dato</th>
            <th>Timer med desimal</th>
            <th>uke timer</th>
            <th>error</th>
          </tr>
          </thead>
          <tbody>
          {dataBeforeSum.map((row, index) => (
            <tr key={index} style={{ borderBottom: row.ukeTimer !== undefined ? '1px black solid' : '0' }}>
              <td>{row.Inn}</td>
              <td>{row.Ut}</td>
              <td>{row.Timer}</td>
              <td>{row.Dag}</td>
              <td>{row.Dato}</td>
              <DesimalTimerRow desimaltimer={row.desimalTimer}/>
              <td>{row.ukeTimer}</td>
              <td>{row.error}</td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

function DesimalTimerRow(props: { desimaltimer?: string }) {
  const { desimaltimer } = props;
  if (!desimaltimer) return <td></td>;
  return <td>
    {desimaltimer}
    <button onClick={() => navigator.clipboard.writeText(desimaltimer)}>
      copy
    </button>
  </td>
}

function timerDesimal(timer: string) {
  if (timer === '') return undefined;
  const [hours, minutes] = timer.split(":").map(Number);
  return (hours + minutes / 60);
}