goog.provide('M.layer.Vector');
goog.require('M.Layer');
goog.require('M.utils');
goog.require('M.exception');
(function() {
  /**
   * @classdesc
   * Main constructor of the class. Creates a Vector layer
   * with parameters specified by the user
   *
   * @constructor
   * @extends {M.Layer}
   * @param {Mx.parameters.Layer} userParameters - parameters
   * @param {Mx.parameters.LayerOptions} options - custom options for this layer
   * @api stable
   */
  M.layer.Vector = (function(parameters = {}, options = {}, impl = new M.impl.layer.Vector(options)) {
    // checks if the implementation can create Vector
    if (M.utils.isUndefined(M.impl.layer.Vector)) {
      M.exception('La implementación usada no puede crear capas Vector');
    }
    /**
     * TODO
     */
    this.style_ = null;
    /**
     * Filter
     * @private
     * @type {M.Filter}
     */
    this.filter_ = null;

    // calls the super constructor
    goog.base(this, parameters, impl);

    this.style_ = options.style;
    this.setStyle(this.style_);

    impl.on(M.evt.LOAD, (features) => this.fire(M.evt.LOAD, [features]));
  });
  goog.inherits(M.layer.Vector, M.Layer);

  /**
   * 'type' This property indicates if
   * the layer was selected
   */
  Object.defineProperty(M.layer.Vector.prototype, "type", {
    get: function() {
      return M.layer.type.Vector;
    },
    // defining new type is not allowed
    set: function(newType) {
      if (!M.utils.isUndefined(newType) &&
        !M.utils.isNullOrEmpty(newType) && (newType !== M.layer.type.Vector)) {
        M.exception('El tipo de capa debe ser \''.concat(M.layer.type.Vector).concat('\' pero se ha especificado \'').concat(newType).concat('\''));
      }
    }
  });

  /**
   * This function add features to layer
   *
   * @function
   * @public
   * @param {Array<M.feature>} features - Features to add
   * @api stable
   */
  M.layer.Vector.prototype.addFeatures = function(features, update = false) {
    if (!M.utils.isNullOrEmpty(features)) {
      if (!M.utils.isArray(features)) {
        features = [features];
      }
      this.getImpl().addFeatures(features, update);
    }
  };

  /**
   * This function returns all features or discriminating by the filter
   *
   * @function
   * @public
   * @param {boolean} applyFilter - Indicates whether execute filter
   * @return {Array<M.Feature>} returns all features or discriminating by the filter
   * @api stable
   */
  M.layer.Vector.prototype.getFeatures = function(skipFilter) {
    if (M.utils.isNullOrEmpty(this.getFilter())) skipFilter = true;
    return this.getImpl().getFeatures(skipFilter, this.filter_);
  };

  /**
   * This function returns the feature with this id
   * @function
   * @public
   * @param {string|number} id - Id feature
   * @return {null|M.feature} feature - Returns the feature with that id if it is found, in case it is not found or does not indicate the id returns null
   * @api stable
   */
  M.layer.Vector.prototype.getFeatureById = function(id) {
    let feature = null;
    if (!M.utils.isNullOrEmpty(id)) {
      feature = this.getImpl().getFeatureById(id);
    }
    else {
      M.dialog.error("No se ha indicado un ID para obtener el feature");
    }
    return feature;
  };

  /**
   * This function remove the features indicated
   *
   * @function
   * @public
   * @param {Array<M.feature>} features - Features to remove
   * @api stable
   */
  M.layer.Vector.prototype.removeFeatures = function(features) {
    if (!M.utils.isArray(features)) {
      features = [features];
    }
    this.getImpl().removeFeatures(features);
  };

  /**
   * This function remove all features
   *
   * @function
   * @public
   * @api stable
   */
  M.layer.Vector.prototype.clear = function() {
    this.removeFilter();
    this.removeFeatures(this.getFeatures(true));
  };

  /**
   * This function refresh layer
   *
   * @function
   * @public
   * @api stable
   */
  M.layer.Vector.prototype.refresh = function() {
    this.getImpl().refresh(true);
    this.redraw();
  };

  /**
   * This function redraw layer
   *
   * @function
   * @public
   * @api stable
   */
  M.layer.Vector.prototype.redraw = function() {
    this.getImpl().redraw();
    if (!M.utils.isNullOrEmpty(this.getStyle())) {
      let style = this.getStyle();
      if (!(style instanceof M.style.Cluster)) {
        style.refresh();
      }
      else {
        let oldStyle = style.getOldStyle();
        if (!M.utils.isNullOrEmpty(oldStyle)) {
          oldStyle.refresh(this);
        }

      }
    }
  };

  /**
   * This function set a filter
   *
   * @function
   * @public
   * @param {M.Filter} filter - filter to set
   * @api stable
   */
  M.layer.Vector.prototype.setFilter = function(filter) {
    if (M.utils.isNullOrEmpty(filter) || (filter instanceof M.Filter)) {
      this.filter_ = filter;
      let style = this.getStyle();
      if (style instanceof M.style.Cluster) {
        // deactivate change cluster event
        style.getImpl().deactivateChangeEvent();
      }
      this.redraw();
      if (style instanceof M.style.Cluster) {
        // activate change cluster event
        style.getImpl().activateChangeEvent();

        // Se refresca el estilo para actualizar los cambios del filtro
        // ya que al haber activado el evento change de source cluster tras aplicar el filter
        // no se actualiza automaticamente
        style.refresh();
      }
    }
    else {
      M.dialog.error("El filtro indicado no es correcto");
    }
  };

  /**
   * This function return filter
   *
   * @function
   * @public
   * @return {M.Filter} returns filter assigned
   * @api stable
   */
  M.layer.Vector.prototype.getFilter = function() {
    return this.filter_;
  };

  /**
   * This function return extent of all features or discriminating by the filter
   *
   * @function
   * @param {boolean} applyFilter - Indicates whether execute filter
   * @return {Array<number>} Extent of features
   * @api stable
   */
  M.layer.Vector.prototype.getFeaturesExtent = function(skipFilter) {
    if (M.utils.isNullOrEmpty(this.getFilter())) skipFilter = true;
    return this.getImpl().getFeaturesExtent(skipFilter, this.filter_);
  };

  /**
   * This function remove filter
   *
   * @function
   * @public
   * @api stable
   */
  M.layer.Vector.prototype.removeFilter = function() {
    this.setFilter(null);
  };

  /**
   * This function checks if an object is equals
   * to this layer
   *
   * @function
   * @public
   * @param {object} obj - Object to compare
   * @api stable
   */
  M.layer.Vector.prototype.equals = function(obj) {
    var equals = false;
    if (obj instanceof M.layer.Vector) {
      equals = this.name === obj.name;
    }
    return equals;
  };

  /**
   * This function sets the style to layer
   *
   * @function
   * @public
   * @param {M.Style}
   * @param {bool}
   */
  M.layer.Vector.prototype.setStyle = function(style, applyToFeature = false) {
    this.oldStyle_ = this.style_;
    let isNullStyle = false;
    if (style === null) {
      isNullStyle = true;
    }
    const applyStyleFn = (style) => {
      const applyStyle = () => {
        if (M.utils.isNullOrEmpty(style)) {
          if (this instanceof M.layer.WFS) {
            style = M.utils.generateStyleLayer(M.layer.WFS.DEFAULT_OPTIONS_STYLE, this);
          }
          else {
            style = M.utils.generateStyleLayer(M.layer.GeoJSON.DEFAULT_OPTIONS_STYLE, this);
          }
        }
        let isCluster = style instanceof M.style.Cluster;
        let isPoint = [M.geom.geojson.type.POINT, M.geom.geojson.type.MULTI_POINT].includes(M.utils.getGeometryType(this));
        if (style instanceof M.Style && (!isCluster || isPoint)) {
          if (!M.utils.isNullOrEmpty(this.oldStyle_)) {
            this.oldStyle_.unapply(this);
          }
          style.apply(this, applyToFeature, isNullStyle);
          this.style_ = style;
          this.fire(M.evt.CHANGE_STYLE, [style, this]);
        }
        if (!M.utils.isNullOrEmpty(this.getImpl().getMap())) {
          let layerswitcher = this.getImpl().getMap().getControls('layerswitcher')[0];
          if (!M.utils.isNullOrEmpty(layerswitcher)) {
            layerswitcher.render();
          }
        }
      };
      return applyStyle;
    };

    if (this.getImpl().isLoaded()) {
      applyStyleFn(style).bind(this)();
    }
    else {
      this.once(M.evt.LOAD, applyStyleFn(style), this);
    }
  };

  /**
   * This function return style vector
   *
   * TODO
   * @api stable
   */
  M.layer.Vector.prototype.getStyle = function() {
    return this.style_;
  };

  /**
   * This function remove the style layer and style of all features
   *
   * @function
   * @public
   * @api stable
   */
  M.layer.Vector.prototype.clearStyle = function() {
    this.setStyle(null);
    this.getFeatures().forEach(feature => feature.clearStyle());
  };

  /**
   * This function checks if an object is equals
   * to this layer
   *
   * @function
   * @api stable
   */
  M.layer.Vector.prototype.getLegendURL = function() {
    let legendUrl = this.getImpl().getLegendURL();
    if (legendUrl.indexOf(M.Layer.LEGEND_DEFAULT) !== -1 && legendUrl.indexOf(M.Layer.LEGEND_ERROR) === -1 && !M.utils.isNullOrEmpty(this.style_)) {
      legendUrl = this.style_.toImage();
    }
    return legendUrl;
  };
})();
