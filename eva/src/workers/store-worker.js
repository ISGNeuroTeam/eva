async function openFile(fileName, create = false) {
  // Get handle to draft file
  const root = await navigator.storage.getDirectory();
  const draftHandle = await root.getFileHandle(fileName, { create });
  // Get sync access handle
  return draftHandle.createSyncAccessHandle();
}

onmessage = async (e) => {
  // Retrieve message sent to work from main script
  const { type, id, body } = e.data;
  let result = null;
  const fileName = `dash-${id}.json`;

  try {
    // Get sync access handle
    const accessHandle = await openFile(fileName, type === 'saveDash');
    // Get size of the file.
    const fileSize = accessHandle.getSize();
    // Read file content to a buffer.
    const buffer = new DataView(new ArrayBuffer(fileSize));

    // console.log('-- %s [size of %s is %d bite]', type, fileName, fileSize);

    if (type === 'getDash') {
      accessHandle.read(buffer, { at: 0 });
      const enc = new TextDecoder();
      result = JSON.parse(enc.decode(buffer));
    } else if (type === 'saveDash') {
      // Write the message to the end of the file.
      const encoder = new TextEncoder();
      const encodedMessage = encoder.encode(body);
      const bufferSize = accessHandle.write(encodedMessage, { at: 0 });
      accessHandle.truncate(bufferSize);
      // Persist changes to disk.
      accessHandle.flush();
      result = 'done';
    }

    // Always close FileSystemSyncAccessHandle if done.
    accessHandle.close();
    return postMessage(result);
  } catch (err) {
    console.warn(err.message);
    return postMessage(null);
  }
};
