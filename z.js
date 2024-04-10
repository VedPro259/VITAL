function createBaseModel() {
  const model = tf.sequential();
  // Setting up the layers
  model.add(tf.layers.conv2d({inputShape: [128,  128,  1], filters:  64, kernelSize:  3, activation: 'relu'}));
  model.add(tf.layers.maxPooling2d({poolSize: [2,  2]}));
  model.add(tf.layers.conv2d({filters:  128, kernelSize:  3, activation: 'relu'}));
  model.add(tf.layers.maxPooling2d({poolSize: [2,  2]}));
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({units:  128, activation: 'relu'}));
  return model;
}
function createSiameseNetwork() {
  const input1 = tf.input({shape: [128,  128,  1]});
  const input2 = tf.input({shape: [128,  128,  1]});
  // Create the base model
  const baseModel = createBaseModel();
  // Process the first input through the base model
  const processed1 = baseModel.apply(input1);
  // Process the second input through the base model
  const processed2 = baseModel.apply(input2);
// Compute the absolute difference between the processed outputs of the two inputs
  const distance = tf.layers.subtract()([processed1, processed2]);
// Apply a dense layer with a single neuron and ReLU activation to the distance. This layer will output the similarity score between the two inputs
  const output = tf.layers.dense({units:  1, activation: 'relu'}).apply(distance);
  // Create the Siamese network model with two inputs and one output
  const model = tf.model({inputs: [input1, input2], outputs: output});
  return model;
}
