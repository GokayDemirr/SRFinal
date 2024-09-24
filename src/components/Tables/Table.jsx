const Table = () => {
  return (
    <div className="">
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Stok Kodu
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Raf No
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Malzeme Sınıfı
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Malzeme Cinsi
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Malzeme Rengi
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Malzeme Yönü
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            PC Kayıt No'su
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            <input
              type="text"
              placeholder="Ara..."
              className="border border-gray-300 rounded-md px-3 py-1"
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                // Tablodaki her bir satırı filtreleme
                // Örneğin: stok kodu, malzeme sınıfı, vb. eşleşiyorsa göster
              }}
            />
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        <tr>
          <td className="px-6 py-4 whitespace-nowrap">12345</td>
          <td className="px-6 py-4 whitespace-nowrap">A1</td>
          <td className="px-6 py-4 whitespace-nowrap">Sınıf A</td>
          <td className="px-6 py-4 whitespace-nowrap">Cins A</td>
          <td className="px-6 py-4 whitespace-nowrap">Kırmızı</td>
          <td className="px-6 py-4 whitespace-nowrap">Yön 1</td>
          <td className="px-6 py-4 whitespace-nowrap">PC-001</td>
        </tr>
        <tr>
          <td className="px-6 py-4 whitespace-nowrap">67890</td>
          <td className="px-6 py-4 whitespace-nowrap">B2</td>
          <td className="px-6 py-4 whitespace-nowrap">Sınıf B</td>
          <td className="px-6 py-4 whitespace-nowrap">Cins B</td>
          <td className="px-6 py-4 whitespace-nowrap">Mavi</td>
          <td className="px-6 py-4 whitespace-nowrap">Yön 2</td>
          <td className="px-6 py-4 whitespace-nowrap">PC-002</td>
        </tr>
        {/* Diğer örnekler buraya eklenebilir */}
      </tbody>
    </div>
  );
};

export default Table;
