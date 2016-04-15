<?php
/**
 * Is Alpha Numeric Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isalphanumeric
 * @copyright   Copyright (C) 2005-2015 fabrikar.com - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugins\Validationrule;

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Is Alpha Numeric Validation Rule
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.validationrule.isalphanumeric
 * @since       3.0
 */
class Isalphanumeric extends Validationrule
{
	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = 'isalphanumeric';

	/**
	 * Validate the elements data against the rule
	 *
	 * @param   string  $data           To check
	 * @param   int     $repeatCounter  Repeat group counter
	 *
	 * @return  bool  true if validation passes, false if fails
	 */
	public function validate($data, $repeatCounter)
	{
		// Could be a drop-down with multi-values
		if (is_array($data))
		{
			$data = implode('', $data);
		}

		if ($data == '')
		{
			return false;
		}

		// Not a word character
		preg_match('/[^\w\s]/', $data, $matches);

		return empty($matches) ? true : false;
	}
}
